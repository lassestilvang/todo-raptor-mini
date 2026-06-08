# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Todo Raptor Mini, please **do not** open a public GitHub issue. Instead, please send an email to the repository maintainer with the following information:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if available)

We take security seriously and will investigate all reported vulnerabilities promptly.

## Security Considerations

### Data Storage

- **Local Storage**: By default, all data is stored locally in SQLite at `db/data.db`
- **S3 Storage**: Attachments can optionally be stored on S3 via the `STORAGE_PROVIDER` environment variable
- **No cloud sync**: Data does not sync to external services by default

### Authentication

- **No built-in auth**: This is a single-user task planner with no authentication mechanism
- **Deployment note**: When deploying, ensure the application is properly secured behind authentication or access controls suitable for your use case

### Dependencies

- Dependencies are regularly reviewed
- Run `bun install` to get the latest security patches
- Use `npm audit` or `bun audit` to check for vulnerabilities

### API Security

- All API routes use Zod for input validation
- Requests are validated before processing
- Error responses do not leak sensitive information

## Best Practices When Deploying

1. **Secure your database**: If deploying to a server, ensure the SQLite database file is not publicly accessible
2. **Use HTTPS**: When deploying publicly, always use HTTPS
3. **Environment variables**: Never commit `.env` or `.env.local` files
4. **Access control**: Implement proper authentication before exposing the application
5. **Regular backups**: Back up your database regularly
6. **Dependency updates**: Keep dependencies up to date with security patches

## Security Headers

When deploying, consider adding security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Questions?

For security questions or concerns, please contact the repository maintainer privately.
