from datetime import date
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


PROJECT_ROOT = Path(__file__).resolve().parent
OUT = PROJECT_ROOT / "Niche_Project_Current_State_and_Improvements.docx"


def p(text=""):
    if text == "":
        return "<w:p/>"
    return (
        "<w:p><w:r><w:t xml:space=\"preserve\">"
        + escape(text)
        + "</w:t></w:r></w:p>"
    )


def heading(text, level=1):
    style = "Heading1" if level == 1 else "Heading2"
    return (
        f"<w:p><w:pPr><w:pStyle w:val=\"{style}\"/></w:pPr>"
        f"<w:r><w:t>{escape(text)}</w:t></w:r></w:p>"
    )


def bullet(text):
    return (
        "<w:p><w:pPr><w:pStyle w:val=\"ListBullet\"/></w:pPr>"
        "<w:r><w:t xml:space=\"preserve\">"
        + escape(text)
        + "</w:t></w:r></w:p>"
    )


def table(rows):
    parts = [
        "<w:tbl>",
        "<w:tblPr><w:tblStyle w:val=\"TableGrid\"/><w:tblW w:w=\"0\" w:type=\"auto\"/></w:tblPr>",
    ]
    for row in rows:
        parts.append("<w:tr>")
        for cell in row:
            parts.append(
                "<w:tc><w:tcPr><w:tcW w:w=\"3000\" w:type=\"dxa\"/></w:tcPr>"
                + p(str(cell))
                + "</w:tc>"
            )
        parts.append("</w:tr>")
    parts.append("</w:tbl>")
    return "".join(parts)


sections = []

sections.append(heading("Niche Social Media App: Current State and Improvement Needs"))
sections.append(p(f"Prepared on {date.today().isoformat()}"))
sections.append(p("Project path reviewed: Project/client and Project/server."))
sections.append(p("This document summarizes the implementation that currently exists in the repository and identifies practical improvements needed before the project can be considered production-ready."))

sections.append(heading("Executive Summary"))
for item in [
    "Niche is a full-stack social media application with a React/Vite frontend, an Express backend, PostgreSQL persistence, session-based authentication, Google OAuth support, image uploads, post feeds, likes, profiles, follows, and user exploration.",
    "The application has a usable feature set and a recognizable separation between client views, API helpers, backend routes, controllers, middleware, and database access.",
    "The README describes the project as production-ready, but the code still needs hardening in security, validation, upload handling, testing, deployment configuration, database management, and maintainability.",
    "Local automated verification could not be completed in this environment because npm fails with: WSL 1 is not supported. Please upgrade to WSL 2 or above. Could not determine Node.js install directory.",
]:
    sections.append(bullet(item))

sections.append(heading("Technology Stack"))
sections.append(table([
    ["Area", "Current implementation"],
    ["Frontend", "React 19.2, React DOM, React Router 7.10, Vite/Rolldown, CSS files in src and public assets"],
    ["Backend", "Node.js, Express 5.2, ES modules, Passport, express-session, bcrypt, Multer, CORS"],
    ["Database", "PostgreSQL through pg Client"],
    ["Authentication", "Email/password with bcrypt plus Google OAuth 2.0 through passport-google-oauth20"],
    ["Storage", "Local filesystem folders under server/public/uploads and server/public/avatars"],
]))

sections.append(heading("Current Project Structure"))
for item in [
    "Project/client contains the React application, public images/icons/fonts, Vite configuration, ESLint configuration, and frontend package files.",
    "Project/server contains the Express API, authentication setup, PostgreSQL connection, route modules, controllers, middleware, and uploaded media folders.",
    "The root Project/README.md contains a detailed setup guide and manually documented SQL schema.",
    "Both client and server include .env.example files. Actual .env files are present locally and should remain uncommitted.",
]:
    sections.append(bullet(item))

sections.append(heading("Frontend State"))
for item in [
    "App.jsx bootstraps the session by calling /api/profile/me, stores session state in React context, loads followed users for the right sidebar, and defines routes for feed, explore, create post, my posts, liked posts, profile, login, and signup.",
    "api.jsx centralizes API calls using VITE_API_BASE with a localhost fallback and sends credentials: include so session cookies are included.",
    "Feed.jsx loads all posts, displays captions/images/profile avatars, opens images in a modal, and supports liking/unliking posts.",
    "New.jsx creates posts using FormData with caption and image fields, then redirects to the feed after success.",
    "MyPosts.jsx loads the logged-in user's posts and allows deletion.",
    "Liked.jsx loads posts liked by the logged-in user and removes a post from the screen after unliking.",
    "Profile.jsx displays profile information, counts, posts grid, follow/unfollow actions, and owner-only profile editing with bio/avatar upload.",
    "Explore.jsx lists other users and allows follow/unfollow actions.",
    "Login.jsx and signup.jsx support traditional username/password auth and link to Google OAuth. Apple and Twitter icons are present but are placeholder links.",
    "Sidebar.jsx and Side2.jsx provide navigation, login/logout display, and followed-user shortcuts.",
    "Styling is spread across multiple CSS files, including sty.css, stylesx.css, stylesy.css, utils.css, App.css, and an old backup stylesheet.",
]:
    sections.append(bullet(item))

sections.append(heading("Backend State"))
for item in [
    "index.js configures Express, CORS, JSON parsing, sessions, Passport, static upload folders, followed-user middleware, route mounting, and a /api/health endpoint.",
    "db.js creates a single PostgreSQL client. It prefers DB_* environment variables, then DATABASE_URL, then a hardcoded local fallback URL.",
    "auth.js configures Passport Google OAuth and creates or updates users based on google_id and username conflicts.",
    "authController.js handles signup, login, and logout. Passwords are hashed with bcrypt. Login and signup store userId and username in the session.",
    "postsRoutes.js exposes endpoints for all posts, create post, my posts, delete post, toggle like, and liked posts. Multer stores post images locally.",
    "postsController.js performs post listing, creation, deletion, like toggling, and liked-post retrieval with SQL queries.",
    "profileRoutes.js exposes current-user, followed-users, explore, profile update, follow, unfollow, and username profile endpoints. Multer stores avatars locally.",
    "profileController.js handles profile lookup, profile update, explore users, follow/unfollow, and followed users.",
    "authMiddleware.js protects routes by requiring req.session.userId.",
    "followedUsers.js fetches a limited followed-user list and attaches it to res.locals, although the React app mainly uses the /api/profile/followed endpoint.",
]:
    sections.append(bullet(item))

sections.append(heading("Implemented Feature Coverage"))
sections.append(table([
    ["Feature", "Current status"],
    ["Signup/login/logout", "Implemented with session cookies and bcrypt password hashing"],
    ["Google OAuth", "Implemented through Passport, requires correct Google credentials and callback URL"],
    ["Feed", "Implemented, ordered by newest posts"],
    ["Post creation", "Implemented for image/caption uploads, but frontend currently requires both caption and image"],
    ["Post deletion", "Implemented for owner only through SQL condition"],
    ["Likes", "Implemented with toggle endpoint and per-user liked state"],
    ["Liked posts", "Implemented"],
    ["Profiles", "Implemented with avatar, bio, counts, and post grid"],
    ["Follow/unfollow", "Implemented"],
    ["Explore people", "Implemented"],
    ["Static media serving", "Implemented from local server folders"],
    ["Automated tests", "Not implemented; server test script intentionally fails"],
]))

sections.append(heading("Key Improvement Needs"))
sections.append(heading("1. Security and Authentication", 2))
for item in [
    "Replace the fallback session secret with a required SESSION_SECRET in all non-local environments. A predictable fallback secret is unsafe.",
    "Add CSRF protection or equivalent safeguards because authenticated state changes use cookies.",
    "Harden session configuration with maxAge, rolling/renewal policy, production store, and secure cookie behavior tested behind the real deployment proxy.",
    "Use a persistent session store such as Redis or PostgreSQL instead of the default in-memory express-session store.",
    "Avoid exposing detailed internal errors to clients, such as failed post creation responses that include the raw database error message.",
    "Add rate limiting for login, signup, upload, follow, and like endpoints.",
    "Normalize and validate usernames, and consider separate email support if the UI says Username or E-mail.",
]:
    sections.append(bullet(item))

sections.append(heading("2. Database and Data Model", 2))
for item in [
    "Move SQL schema from README text into real migrations using a tool such as node-pg-migrate, Knex migrations, Prisma migrations, or Drizzle migrations.",
    "Review column naming consistency. The code inserts into users.password, while the README schema references password_hash. The application and documentation should agree.",
    "Use a pg Pool instead of a single pg Client for production request concurrency.",
    "Remove the hardcoded LOCAL_DB_URL containing postgres:1234 and require configuration through environment variables.",
    "Add database constraints and indexes for likes(user_id, post_id), follows(follower_id, following_id), posts(user_id), posts(created_at), users(username), and users(google_id).",
    "Wrap multi-step destructive operations in transactions, especially deleting likes and posts together.",
    "Prevent self-following explicitly at the API and database level.",
]:
    sections.append(bullet(item))

sections.append(heading("3. File Uploads and Media", 2))
for item in [
    "Add Multer file size limits and MIME/type validation for images.",
    "Generate safer filenames for post uploads. Current post image filenames use Date.now plus original extension, which can collide and preserves user-controlled extensions.",
    "Clean up uploaded image files when a post is deleted or an avatar is replaced.",
    "Move production media storage to object storage such as S3, Cloudinary, Azure Blob Storage, or similar. Local disk uploads are fragile on many hosting platforms.",
    "Add image optimization/resizing and thumbnail generation to improve feed performance.",
]:
    sections.append(bullet(item))

sections.append(heading("4. Frontend User Experience", 2))
for item in [
    "Protect routes on the client side. Logged-out users can navigate to authenticated pages and only discover the issue after API calls fail.",
    "Use React Router Link/NavLink consistently instead of plain anchor tags for internal profile navigation to avoid full page reloads.",
    "Make post creation behavior consistent. The backend allows caption-only or image-only posts, but the frontend requires both caption and image.",
    "Replace alert and window.confirm flows with the existing toast/modal system for a more consistent user experience.",
    "Remove or implement Apple and Twitter auth buttons. Placeholder href=\"#\" links create dead UI.",
    "Add empty, error, and loading states consistently across Explore, My Posts, Liked Posts, and Profile.",
    "Consolidate duplicate image modal code that appears in multiple pages.",
]:
    sections.append(bullet(item))

sections.append(heading("5. Code Maintainability", 2))
for item in [
    "Clean up filename/comment mismatches such as Feed.jsx comments saying Feed.js and New.jsx comments saying NewExact.js.",
    "Consolidate CSS files and remove sty-old-backup.css if it is no longer used.",
    "Create reusable PostCard, ImageModal, Avatar, FollowButton, and API error helpers to reduce repeated code.",
    "Add stronger API response handling in apiFetch helpers, including a shared error type and optional automatic JSON parsing.",
    "Separate environment-specific configuration from application logic.",
    "Reduce noisy comments that explain obvious imports, and keep comments for non-obvious business logic or integration details.",
]:
    sections.append(bullet(item))

sections.append(heading("6. Testing and Quality Assurance", 2))
for item in [
    "Add backend tests for auth, posts, likes, follows, profile updates, and authorization failures.",
    "Add frontend component or integration tests for login/signup, feed rendering, post creation, profile edit, follow/unfollow, and like/unlike.",
    "Add end-to-end tests for the critical user journey: signup, create post, like post, follow user, edit profile, logout/login.",
    "Fix the server test script, which currently exits with Error: no test specified.",
    "Run lint/build in a supported Node environment. In this review, npm checks were blocked by WSL 1 Node compatibility.",
    "Add CI so lint, build, and tests run automatically on every pull request.",
]:
    sections.append(bullet(item))

sections.append(heading("7. Production Readiness", 2))
for item in [
    "Add deployment-specific configuration for trusted proxy, secure cookies, CORS origins, HTTPS, and OAuth callback URLs.",
    "Introduce structured logging and centralized error handling middleware.",
    "Add monitoring for API errors, database connectivity, upload failures, and frontend runtime errors.",
    "Create backup and restore procedures for PostgreSQL and uploaded media.",
    "Document the exact deployment target and update the README so it does not overstate production readiness.",
]:
    sections.append(bullet(item))

sections.append(heading("Risk Assessment"))
sections.append(table([
    ["Risk", "Severity", "Why it matters"],
    ["Default in-memory sessions", "High", "Users may be logged out on restart and sessions will not scale across multiple server instances."],
    ["No CSRF protection", "High", "Cookie-authenticated POST/PUT/DELETE routes can be targeted if no additional protection is added."],
    ["Unrestricted uploads", "High", "Large or unexpected files can consume disk space or create security exposure."],
    ["No automated tests", "High", "Regressions in auth, posts, and profile behavior may go unnoticed."],
    ["Hardcoded database fallback", "Medium", "Local credentials and assumptions can leak into environments or confuse setup."],
    ["CSS and component duplication", "Medium", "Future UI changes will be slower and easier to break."],
    ["Placeholder social buttons", "Low", "Users may attempt unsupported auth flows."],
]))

sections.append(heading("Recommended Roadmap"))
sections.append(heading("Immediate Priorities", 2))
for item in [
    "Fix environment setup so npm lint/build/tests can run successfully.",
    "Add file upload limits/type checks and remove raw error details from API responses.",
    "Require secure session configuration and add a production session store.",
    "Align README schema with actual code and introduce migrations.",
    "Add basic backend tests for auth and protected post/profile routes.",
]:
    sections.append(bullet(item))

sections.append(heading("Next Phase", 2))
for item in [
    "Refactor reusable frontend components for post cards, modals, avatars, and follow controls.",
    "Improve client route protection and user feedback states.",
    "Move media to cloud/object storage and add image cleanup.",
    "Add CI with lint, build, and automated tests.",
    "Improve deployment documentation with exact commands, environment variables, and production checklist.",
]:
    sections.append(bullet(item))

sections.append(heading("Conclusion"))
sections.append(p("The project is a strong functional prototype of a social media app. It already demonstrates the main product flows: accounts, sessions, posts, likes, profiles, follows, exploration, and image handling. The most important next step is to shift from prototype completeness to engineering reliability: secure sessions, validated uploads, real migrations, tests, route protection, production storage, and clearer documentation. Once those are addressed, the project will be much closer to the production-ready state described in the README."))

document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
 <w:body>
  {''.join(sections)}
  <w:sectPr>
   <w:pgSz w:w="12240" w:h="15840"/>
   <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
  </w:sectPr>
 </w:body>
</w:document>
"""

styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
 <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
  <w:name w:val="Normal"/>
  <w:qFormat/>
  <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
  <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr>
 </w:style>
 <w:style w:type="paragraph" w:styleId="Heading1">
  <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
  <w:pPr><w:spacing w:before="360" w:after="160"/><w:outlineLvl w:val="0"/></w:pPr>
  <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
 </w:style>
 <w:style w:type="paragraph" w:styleId="Heading2">
  <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
  <w:pPr><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="1"/></w:pPr>
  <w:rPr><w:b/><w:sz w:val="26"/></w:rPr>
 </w:style>
 <w:style w:type="paragraph" w:styleId="ListBullet">
  <w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:qFormat/>
  <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
 </w:style>
 <w:style w:type="table" w:styleId="TableGrid">
  <w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:uiPriority w:val="59"/>
  <w:tblPr><w:tblBorders>
   <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
   <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
   <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
   <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
   <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
   <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
  </w:tblBorders></w:tblPr>
 </w:style>
</w:styles>
"""

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="xml" ContentType="application/xml"/>
 <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
 <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""

with ZipFile(OUT, "w", ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/_rels/document.xml.rels", doc_rels)
    z.writestr("word/document.xml", document_xml)
    z.writestr("word/styles.xml", styles_xml)

print(OUT)
