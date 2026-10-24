# Alnouras website

Static Astro website with TypeScript and Tailwind CSS. The blue and yellow design uses real Al Nouras fleet and staff photography, locally hosted variable fonts, a photographic landing animation, scroll reveals, service detail dialogs, an interactive Leaflet map, and mobile navigation.

## Development

Run `npm install`, then `npm run dev`. Run `npm run build` for the production site in `dist/`, and `npm run preview` to inspect that build. On Windows PowerShell with restricted script execution, use `npm.cmd`.

Run `npm run check` for Astro and TypeScript diagnostics.

## Coverage and activity demonstration

The map includes 12 illustrative Dubai collection locations, red markers, animated connections and a simulated vehicle. Service filters, district buttons, map popups and recenter controls are interactive. The activity panel can be paused and automatically stops updating when off-screen, hidden or reduced motion is enabled.

All vehicle identifiers, pickups, the 1,200+ client total and the 60+ fleet total are explicitly labelled as demonstration data. Connections are not road routes or an official service boundary. The map uses OpenStreetMap data and CARTO tiles with visible attribution; a local schematic remains available if tiles cannot load. No operational application data is exposed.

## Enquiries

The form validates fields, prepares a mailto link to the published company email address, and offers a local text download. The visitor reviews and sends the email in their own email app; the form does not automatically transmit or persist personal information.

## Content and imagery

- Company services and approval wording: https://www.alnouras.com/
- Published email and phone: https://www.alnouras.com/contact/
- Company photos: `banner5.jpg`, `albanner2.jpg`, `albanner3.jpg` and `albanner4.jpg` from the existing website's `/wp-content/uploads/2019/04/` directory, converted to local WebP images.
- Hospital photo: illustrative Unsplash image at https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d
- Thirty years of experience: provided by the project owner.

## Before public launch

- Approve the refreshed wordmark and archive photos, or supply current fleet and staff photography.
- Confirm company wording, approval status, service coverage and the continued accuracy of published contact details.
- Replace demonstration totals and activity with approved figures or remove the demo. A real activity feed should use an explicitly approved, anonymized public endpoint.
- Confirm any advertised 24/7 collection service. Current copy promises 24/7 enquiry access and invites discussion of out-of-hours collection availability.
- Pricing copy uses competitive, tailored rates. No unsupported cheapest-in-market or highest-quality comparison is made.
- Optionally connect the form to a delivery endpoint with server validation and spam protection.
- Add the final domain, canonical URLs, sitemap, social sharing image and any required privacy information once hosting and form processing are selected.
- Develop dedicated service pages and Arabic content using approved copy.

This project is independent of the fleet, HR and payroll app. It has no database or operational app credentials.
