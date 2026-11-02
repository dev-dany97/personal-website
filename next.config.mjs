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

const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
	? new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).origin
	: '';

const csp = [
	"default-src 'self'",
	"img-src 'self' data: https://media.valorant-api.com",
	`media-src 'self' ${mediaOrigin}`,
	`script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com ${umamiOrigins}`,
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' data: https://fonts.gstatic.com",
	`connect-src 'self' https://formspree.io ${umamiOrigins}`,
	"form-action 'self' https://formspree.io",
	"frame-ancestors 'none'",
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
					{ key: 'X-Frame-Options', value: 'DENY' },
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
