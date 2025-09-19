# Security Guide

This document outlines the security measures implemented in the Sticker Factory application and best practices for deployment.

## Overview

The Sticker Factory application implements multiple layers of security to protect against common web vulnerabilities including XSS, file upload attacks, and data injection.

## Security Features

### Input Validation & Sanitization

#### Text Input Security
- **Length Limits**: User text input is limited to 10,000 characters
- **HTML Entity Encoding**: All HTML characters (`<`, `>`, `"`, `'`, `&`) are encoded
- **Script Tag Removal**: `<script>` tags are completely removed
- **Protocol Filtering**: `javascript:` and dangerous data URLs are filtered out

```typescript
// Example: Secure text input handling
const safeText = sanitizeTextInput(userInput)
```

#### File Upload Security
- **MIME Type Validation**: Only JSON files (`application/json`) are accepted for imports
- **File Size Limits**:
  - General uploads: 10MB maximum
  - JSON imports: 2MB maximum
- **Content Validation**: JSON structure is validated before processing

#### SVG Content Security
- **Script Removal**: All `<script>` tags are removed from SVG content
- **Event Handler Removal**: Dangerous event handlers (onclick, onload, etc.) are removed
- **Foreign Object Removal**: `<foreignObject>` elements that can contain HTML are removed
- **Structure Validation**: SVG content must have valid SVG structure

### Font Loading Security

#### URL Validation
- **HTTPS Only**: All font URLs must use HTTPS protocol
- **Trusted Domains**: Only whitelisted domains are allowed:
  - `fonts.googleapis.com`
  - `fonts.gstatic.com`
- **URL Structure Validation**: Font URLs are validated using URL parser

```typescript
// Example: Secure font loading
const isValid = validateFontUrl('https://fonts.googleapis.com/css2?family=Roboto')
```

### Data Import/Export Security

#### Import Validation
- **Schema Validation**: Imported data must match expected structure
- **Required Fields**: Essential fields (`textInputs`, `selectedTemplateId`) are required
- **Type Checking**: All data types are validated before processing
- **Text Sanitization**: All imported text content is sanitized

#### Export Safety
- **No Sensitive Data**: Exports contain only user-generated content and settings
- **Clean Data**: All exported data is validated and sanitized

## Security Architecture

### Entry Point Sanitization
Following the principle of "sanitize at entry points only", all user input is cleaned when it enters the system:

1. **File Upload**: `validateFileUpload()` at upload handlers
2. **Text Input**: `sanitizeTextInput()` in store mutations
3. **Import Data**: `validateImportData()` and sanitization in import handlers
4. **Font URLs**: `validateFontUrl()` in font loading system

### Defense in Depth
Multiple layers of protection:

1. **Client-side validation** (first line of defense)
2. **Input sanitization** (second line of defense)
3. **Output encoding** (third line of defense)
4. **CSP headers** (recommended for deployment)

## Deployment Security

### Content Security Policy (CSP)
Recommended CSP headers for production deployment:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self';
  img-src 'self' data: blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

### HTTP Security Headers
Additional recommended security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Environment Configuration
- **Development**: Full logging and debug information enabled
- **Production**: Logging disabled, error reporting to monitoring service

## Security Testing

### Automated Tests
The application includes comprehensive security tests:

- **Input Sanitization Tests**: 8 test cases covering XSS prevention
- **File Upload Tests**: 4 test cases covering file validation
- **Font URL Tests**: 5 test cases covering URL validation
- **Import Validation Tests**: 6 test cases covering data structure validation

Run security tests:
```bash
npm run test src/test/security.test.ts
```

### Security Checklist

#### Pre-deployment
- [ ] All security tests passing
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Error handling doesn't leak sensitive information

#### Regular Maintenance
- [ ] Dependency security audit: `npm audit`
- [ ] Update dependencies regularly
- [ ] Monitor security advisories
- [ ] Review logs for suspicious activity

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. **Do not** create a public issue
2. Email security concerns to the maintainers
3. Include detailed information about the vulnerability
4. Allow reasonable time for response before disclosure

## Security Metrics

Current security implementation metrics:
- **File Upload Protection**: MIME type + size validation
- **Text Input Protection**: 10,000 character limit + HTML encoding
- **SVG Protection**: Script removal + event handler filtering
- **Font Loading Protection**: HTTPS + domain whitelist
- **Test Coverage**: 25 security-focused test cases

## Performance vs Security

The security measures are designed to have minimal performance impact:
- **Validation**: O(1) checks for most validations
- **Sanitization**: Linear time with input size, but limited by max length
- **Caching**: Security validation results cached where possible
- **Lazy Loading**: Security-validated fonts loaded on demand

## Future Security Enhancements

Planned security improvements:
- Server-side validation for enhanced security
- Rate limiting for file uploads
- Advanced malware scanning for uploaded files
- Content integrity monitoring
- Automated security testing in CI/CD pipeline

---

**Last Updated**: January 2025
**Security Version**: 1.0.0