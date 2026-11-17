# Portfolio browsing

## Purpose

Help visitors navigate Lauren's Film and Art practices from their main sections through curated subsections to individual project photography.

## ADDED Requirements

### Requirement: Practice landing pages
Film and Art SHALL each offer a large hero carousel of cleared photographs of Lauren working in that practice, followed by linked subsection previews with curated image carousels.

#### Scenario: Initial Film landing
- **WHEN** a visitor opens Film with its initial subsection configuration
- **THEN** they can find Filmography, On-set, and Scenic, Props & Sets and navigate to each subsection

#### Scenario: Initial Art landing
- **WHEN** a visitor opens Art with its initial subsection configuration
- **THEN** they can find Inverted Paintings, Illustration, Jewellery, and Painting and navigate to each subsection

### Requirement: CMS-managed subsections
An authorised editor SHALL be able to add, edit and reorder Film and Art subsections in the CMS, including their introductions, project references and curated images. Changes SHALL remain subject to the existing content and publication safeguards.

#### Scenario: Add and reorder a subsection
- **WHEN** an authorised editor saves an eligible new subsection and changes its position
- **THEN** the subsection appears in the chosen practice and order after the normal approved publishing workflow

#### Scenario: Invalid or unapproved content
- **WHEN** a subsection references a missing project or media that is not cleared for its intended use
- **THEN** validation prevents that invalid or unapproved content from being published

#### Scenario: Rename a subsection
- **WHEN** an editor changes a subsection name or its URL
- **THEN** existing published links continue to reach that subsection directly or through a tested redirect

### Requirement: Subsection and project hierarchy
Each subsection SHALL present a text-only introductory hero followed by individual project previews with curated carousels. Each project SHALL present a text-only introductory hero followed by its photographs.

#### Scenario: Browse a subsection
- **WHEN** a visitor opens a subsection with approved projects
- **THEN** its introduction precedes the linked project previews and their curated images

#### Scenario: Open a project
- **WHEN** a visitor opens an approved project
- **THEN** its introduction appears before its photographs

### Requirement: Curated content and incomplete sections
Images and text SHALL use only facts and media cleared for their specific use. A section with insufficient cleared material SHALL remain accessible with an honest holding state; it SHALL NOT invent content or expose archived or unapproved media.

#### Scenario: Working photograph is unavailable
- **WHEN** no suitable working photograph is cleared for a hero
- **THEN** the page presents a non-misleading media-free state until one is approved

#### Scenario: Zero or one image
- **WHEN** a carousel has no cleared images or a single cleared image
- **THEN** it shows an appropriate empty or static state without inoperable carousel controls

### Requirement: Accessible carousel operation
Visitors SHALL be able to operate carousels with pointer, touch and keyboard; controls SHALL have accessible names, visible focus and a perceivable current position. Automatic movement SHALL be pausable and respect reduced-motion preferences.

#### Scenario: Navigate without pointer
- **WHEN** a keyboard user focuses carousel controls and chooses next or previous
- **THEN** the visible image and its accessible position update without moving focus unexpectedly

#### Scenario: Reduced motion
- **WHEN** reduced motion is requested
- **THEN** automatic advancement and nonessential carousel motion are disabled

### Requirement: Image detail exploration
Project photos SHALL support hold-to-enlarge within the photo area and moving the pointer or touch position SHALL reveal image detail. An accessible tap and keyboard-operated equivalent SHALL provide entry, movement and exit without sustained pressure.

#### Scenario: Explore and release
- **WHEN** a visitor holds and moves across a suitable project image
- **THEN** the photo area shows the corresponding enlarged detail and returns to the normal image on release or cancellation

#### Scenario: Explore without holding
- **WHEN** a visitor activates the accessible detail control
- **THEN** they can move through the image and close the detail view using keyboard or touch without holding

#### Scenario: Limited image resolution
- **WHEN** an image lacks sufficient resolution for useful enlargement
- **THEN** it remains viewable at its normal size and is not misleadingly enlarged

### Requirement: Existing destinations and safeguards
Previously published project and collection destinations SHALL continue to reach the same content directly or through a tested redirect. Existing content permissions, noindex and disabled enquiry behaviour SHALL remain in force.

#### Scenario: Existing project link
- **WHEN** a visitor follows an existing published project or collection URL
- **THEN** they reach that same record without a broken link or loss of its enquiry controls
