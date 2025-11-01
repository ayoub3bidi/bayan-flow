# Security Policy

## Supported Versions

We actively support the following versions of Bayan Flow:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Bayan Flow seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Send an email to [contact@ayoub3bidi.me](mailto:contact@ayoub3bidi.me) with:
   - A clear description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 5 business days
- **Updates**: We will keep you informed of our progress throughout the investigation
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

### Responsible Disclosure

We follow responsible disclosure practices:

- We will work with you to understand and resolve the issue
- We will not take legal action against researchers who:
  - Report vulnerabilities in good faith
  - Do not access or modify user data
  - Do not disrupt our services
  - Follow this disclosure process

### Recognition

We appreciate security researchers who help keep Bayan Flow safe. With your permission, we will:

- Acknowledge your contribution in our security advisories
- Include you in our hall of fame (if you wish)
- Provide updates on the fix implementation

## Security Best Practices

### For Users

- Keep your browser updated to the latest version
- Be cautious when running the application with custom algorithms
- Report any suspicious behavior or unexpected errors

### For Contributors

- Follow secure coding practices
- Validate all inputs and sanitize outputs
- Use dependency scanning tools
- Keep dependencies updated
- Follow the principle of least privilege

## Security Features

Bayan Flow implements several security measures:

- **Client-side only**: No server-side data processing or storage
- **No external API calls**: All algorithms run locally in the browser
- **Content Security Policy**: Implemented to prevent XSS attacks
- **Dependency scanning**: Regular automated security scans
- **Code review**: All contributions are reviewed for security issues

## Known Security Considerations

- **Algorithm execution**: Custom algorithms run in the browser context
- **Local storage**: User preferences are stored locally in the browser
- **Third-party dependencies**: We regularly audit and update dependencies

## Contact

For security-related questions or concerns, please contact:
- Email: [contact@ayoub3bidi.me](mailto:contact@ayoub3bidi.me)
- Subject line: "Bayan Flow Security"

Thank you for helping keep Bayan Flow secure!
