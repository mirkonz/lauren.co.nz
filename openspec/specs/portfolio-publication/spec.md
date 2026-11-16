# portfolio-publication Specification

## Purpose

Preserve the existing portfolio publication safeguards while content migration,
editorial publishing, enquiry delivery and custom-domain launch retain their
separate review and authorisation boundaries.

## Requirements

### Requirement: Production content eligibility

Production content SHALL require verified facts and approved publication permission for every referenced content image. Draft/review records bearing content images SHALL fail production validation even when their pages would not render. This records existing behaviour and grants no additional image rights.

#### Scenario: Image-bearing draft or review record
- **WHEN** a production build includes a draft or review record with a content cover or gallery image
- **THEN** validation fails before a deployable site is produced

#### Scenario: Published record with restricted imagery or unverified facts
- **WHEN** a production build includes a published record with restricted or unreviewed imagery, or unverified facts
- **THEN** validation rejects the record

### Requirement: Source evidence exclusion

The production site SHALL exclude source archives, audit evidence, test fixtures, Storybook output and internal generated enquiry data. Rendered portfolio pages SHALL use cleared local media rather than Wix hotlinks.

#### Scenario: Production output is inspected
- **WHEN** the normal production build succeeds
- **THEN** its output contains none of the source archive, audit documents, test fixture routes, Storybook output or internal enquiry catalogue
- **AND** rendered portfolio pages contain no Wix media hotlinks

### Requirement: Prelaunch indexing boundary

The current prelaunch site SHALL retain page-level noindex directives, the noindex response-header configuration and crawler blocking. These controls SHALL NOT be represented as access protection or custom-domain launch approval.

#### Scenario: Prelaunch build completes
- **WHEN** the current prelaunch site is built
- **THEN** rendered pages retain noindex, the response-header configuration retains noindex, and robots.txt blocks crawling without advertising a sitemap

### Requirement: Disabled enquiry responses

Until a separately reviewed integration changes this contract, the enquiry endpoint SHALL accept no messages. POST requests SHALL return 503 with no success confirmation; other methods SHALL return 405 and advertise POST. Synthetic form success states SHALL NOT be treated as delivery evidence.

#### Scenario: Visitor submits while sending is disabled
- **WHEN** a visitor sends POST to the current enquiry endpoint
- **THEN** the response status is 503 and states that no message was accepted

#### Scenario: Unsupported enquiry method
- **WHEN** a request uses a method other than POST at the enquiry endpoint
- **THEN** the response status is 405 with Allow set to POST
