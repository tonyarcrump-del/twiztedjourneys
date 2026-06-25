# NoCapsAI Platform Domains

## Source of Truth

- Owner, creator, and platform publisher: NoCapsAI LLC
- Official site: https://nocapsai.com
- Support: njwhitt@nocapsai.com

## Grant Writer

The grant writer public/admin application URL should be:

`https://grants.nocapsai.com`

Use this URL unless a different deployment URL is explicitly selected later.

## Podcast Workflow

The podcast workflow application URL should be:

`https://podcast.nocapsai.com`

Private Twizted Journeys workflow/admin access should use:

`https://podcast.nocapsai.com/twizted-journeys`

If the future multi-client studio/client workspace is selected, it may use:

`https://studio.nocapsai.com`

with Twizted Journeys access at:

`https://studio.nocapsai.com/twizted-journeys`

Public Twizted Journeys podcast and media content remains client-branded at:

- `https://twiztedjourneys.org/podcast`
- `https://twiztedjourneys.org/media`

## Ownership Boundary

Twizted Journeys owns its client content, including its name, logo, stories, voice, approved podcast episodes, photos, videos, public descriptions, event information, nonprofit-specific materials, donor information, grant information, and other supplied materials.

NoCapsAI LLC owns the platform, software, reusable code, workflow system, admin dashboard, templates, prompts, automation logic, safety review process, publishing workflow, documentation structure, and implementation unless a separate written agreement says otherwise.

## Environment Examples

When the separate Next.js applications are configured, their example environment files may use placeholders such as:

```dotenv
NEXT_PUBLIC_NOCAPSAI_URL=https://nocapsai.com
NEXT_PUBLIC_SUPPORT_EMAIL=njwhitt@nocapsai.com
```

Grant writer:

```dotenv
NEXT_PUBLIC_APP_URL=https://grants.nocapsai.com
```

Podcast workflow:

```dotenv
NEXT_PUBLIC_APP_URL=https://podcast.nocapsai.com
```

Do not place real secrets, API keys, database URLs, or private credentials in example environment files.

## DNS

Do not add guessed DNS records in GoDaddy or any other registrar. Final DNS records must come from the selected hosting provider, likely Vercel, and must be reviewed before they are entered at the registrar.
