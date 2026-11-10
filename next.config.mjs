// Umami's script and its event endpoint live on whatever host
// NEXT_PUBLIC_UMAMI_SRC points to (self-hosted or Umami Cloud), so the CSP
// follows that build-time variable instead of hard-coding a host.
const umamiOrigins = (() => {
	const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
	if (!src) return [];
	const origin = new URL(src).origin;
	// Umami Cloud serves the script from cloud.umami.is but sends events to gateway.umami.is.
	return origin.endsWith('.umami.is') ? [origin, 'https://gateway.umami.is'] : [origin];
})().join(' ');

// Only these origins may embed the site in an iframe. Add your own
// dashboards (e.g. Home Assistant) via FRAME_ANCESTORS, space-separated.
const frameAncestors = ["'self'", ...(process.env.FRAME_ANCESTORS ?? '').split(' ').filter(Boolean)].join(' ');

const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
	? new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).origin
	: '';

const csp = [
	"default-src 'self'",
	// Spotify-Player auf der Finance-Seite (lädt erst nach Klick).
	"frame-src 'self' https://www.youtube-nocookie.com",
	"img-src 'self' data: https://media.valorant-api.com",
	// data: is needed by public/pc-modell.html, which carries the clip for the
	// model's 7-inch display inline as a data URI.
	`media-src 'self' data: ${mediaOrigin}`,
	`script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com ${umamiOrigins}`,
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' data: https://fonts.gstatic.com",
	`connect-src 'self' https://formspree.io ${umamiOrigins}`,
	"form-action 'self' https://formspree.io",
	`frame-ancestors ${frameAncestors}`,
	"base-uri 'self'",
	"object-src 'none'"
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: '.next-fresh',
	poweredByHeader: false,
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					// No X-Frame-Options: it cannot allow a single foreign origin, and
					// frame-ancestors in the CSP below takes precedence in modern browsers.
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
					{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
					{ key: 'Content-Security-Policy', value: csp }
				]
			}
		];
	}
};

export default nextConfig;
