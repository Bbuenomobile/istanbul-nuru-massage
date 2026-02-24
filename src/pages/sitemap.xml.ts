import type { APIRoute } from 'astro';
const domain = 'https://nurumassageistanbul.top';
const apiUrl = 'https://www.erotikmaps.com/api/v1/satellite';
const citySlug = 'istanbul';
const countrySlug = 'turkey';
const categorySlug = 'erotic-massage';
const fakeCategories: string[] = ["nuru-massage","tantric-massage","body-to-body-massage","sensual-massage","happy-ending-massage","adult-massage","nude-massage","tantra-massage","couples-massage","sex-massage","prostate-massage","lingam-massage"];

export const GET: APIRoute = async () => {
    let listings: any[] = [];
    
    try {
        const res = await fetch(`${apiUrl}/listings?city=${citySlug}&category=${categorySlug}&limit=200`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'Sitemap-Generator/1.0' }
        });
        if (res.ok) {
            const data = await res.json();
            listings = (data.data || []).filter((l: any) => l && l.slug);
        }
    } catch (e) {
        console.error('Sitemap: Failed to fetch city listings');
    }

    if (listings.length === 0) {
        try {
            const res = await fetch(`${apiUrl}/listings?country=${countrySlug}&category=${categorySlug}&limit=200`, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'Sitemap-Generator/1.0' }
            });
            if (res.ok) {
                const data = await res.json();
                const all = (data.data || []).filter((l: any) => l && l.slug);
                const goldOnes = all.filter((l: any) => l.is_gold);
                const premiumOnes = all.filter((l: any) => l.is_premium && !l.is_gold);
                const others = all.filter((l: any) => !l.is_premium && !l.is_gold);
                const selected = others.sort((a: any, b: any) => (a.id || 0) - (b.id || 0)).slice(0, 20);
                listings = [...goldOnes, ...premiumOnes, ...selected];
            }
        } catch (e) {
            console.error('Sitemap: Failed to fetch country fallback listings');
        }
    }

    const today = new Date().toISOString().split('T')[0];

    const staticPages: { url: string; priority: string; changefreq: string }[] = [
        { url: domain + '/', priority: '1.0', changefreq: 'daily' },
        { url: domain + '/advertise', priority: '0.8', changefreq: 'monthly' },
        { url: domain + '/contact-business', priority: '0.6', changefreq: 'monthly' },
    ];

    fakeCategories.forEach(cat => {
        staticPages.push({ url: domain + '/' + cat, priority: '0.7', changefreq: 'weekly' });
    });

    const listingPages = listings.map((l: any) => ({
        url: domain + '/' + l.slug,
        priority: l.is_gold ? '0.9' : (l.is_premium ? '0.8' : '0.6'),
        changefreq: 'weekly'
    }));

    const allPages = [...staticPages, ...listingPages];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml.trim(), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
};