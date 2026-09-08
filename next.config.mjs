const csp = [
	"default-src 'self'",
	"img-src 'self' data: https://media.valorant-api.com",
	"media-src 'self'",
	"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
	"style-src 'self' 'unsafe-inline'",
	"font-src 'self' data:",
	"connect-src 'self' https://formspree.io",
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
