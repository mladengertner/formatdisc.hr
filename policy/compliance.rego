# FormatDisc.hr OPA Compliance Policies
# GDPR / SOC2 / HIPAA Automated Checks

package formatdisc.compliance

import future.keywords.in

# Default deny
default allow = false

# GDPR Compliance Rules
gdpr_compliant {
    input.data_encryption == true
    input.user_consent_mechanism == true
    input.data_deletion_capability == true
    input.audit_logging == true
}

# SOC2 Compliance Rules
soc2_compliant {
    input.access_controls == true
    input.encryption_at_rest == true
    input.encryption_in_transit == true
    input.audit_trails == true
    input.incident_response_plan == true
}

# HIPAA Compliance Rules (if applicable)
hipaa_compliant {
    input.phi_encryption == true
    input.access_logging == true
    input.minimum_necessary_access == true
}

# Security Best Practices
security_compliant {
    no_hardcoded_secrets
    secure_headers_configured
    rate_limiting_enabled
}

no_hardcoded_secrets {
    not contains(input.codebase, "sk_live_")
    not contains(input.codebase, "password=")
    not contains(input.codebase, "api_key=")
}

secure_headers_configured {
    input.headers.x_frame_options == "DENY"
    input.headers.x_content_type_options == "nosniff"
    input.headers.strict_transport_security != ""
}

rate_limiting_enabled {
    input.rate_limiting.enabled == true
    input.rate_limiting.max_requests > 0
}

# Main compliance check
allow {
    gdpr_compliant
    soc2_compliant
    security_compliant
}

# Compliance report
compliance_report = {
    "gdpr": gdpr_compliant,
    "soc2": soc2_compliant,
    "hipaa": hipaa_compliant,
    "security": security_compliant,
    "overall": allow,
    "timestamp": time.now_ns()
}
