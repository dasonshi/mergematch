# MergeMatch: Gap Specifications Document

> **Purpose**: Detailed specifications for each gap identified in the Technical Design Document
> **Status**: Draft
> **Last Updated**: 2025-12-21

---

## Table of Contents

1. [API Specification (OpenAPI)](#1-api-specification-openapi)
2. [Testing Strategy](#2-testing-strategy)
   - 2.8 Load Testing (k6)
   - 2.9 Security Testing
   - 2.10 Chaos Engineering
3. [DevOps & Infrastructure](#3-devops--infrastructure)
4. [Security Specification](#4-security-specification)
   - 4.9 STRIDE Threat Model
   - 4.10 OWASP Top 10 Mapping
   - 4.11 Security Testing Checklist
5. [Error Handling & Edge Cases](#5-error-handling--edge-cases)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [Matching Engine Edge Cases](#7-matching-engine-edge-cases)
8. [Frontend Specification](#8-frontend-specification)
   - 8.6 User Flow Diagrams (Mermaid)
   - 8.7 Microcopy Guidelines
   - 8.8 Empty State Designs
9. [Billing & Pricing](#9-billing--pricing)
10. [Data Migration & Onboarding](#10-data-migration--onboarding)
11. [Documentation Strategy](#11-documentation-strategy)
    - 11.4 Code Style Configuration
    - 11.5 README Template
    - 11.6 CONTRIBUTING Template
    - 11.7 PR Template
    - 11.8 Issue Templates
12. [Release Strategy](#12-release-strategy)
13. [Architecture Decision Records](#13-architecture-decision-records-adrs)

---

# 1. API SPECIFICATION (OpenAPI)

## 1.1 Overview

MergeMatch API follows REST conventions with JSON payloads. All endpoints require authentication via GHL OAuth tokens passed through to our backend.

**Base URL**: `https://api.mergematch.app/v1`
**Content-Type**: `application/json`
**Authentication**: Bearer token (GHL access token or MergeMatch session token)

## 1.2 OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: MergeMatch API
  description: Data matching and deduplication API for GoHighLevel
  version: 1.0.0
  contact:
    name: MergeMatch Support
    email: support@mergematch.app

servers:
  - url: https://api.mergematch.app/v1
    description: Production
  - url: https://staging-api.mergematch.app/v1
    description: Staging
  - url: http://localhost:8000/v1
    description: Development

tags:
  - name: Authentication
    description: OAuth and session management
  - name: Matches
    description: Duplicate match pair operations
  - name: Merges
    description: Merge execution and history
  - name: Rules
    description: Match rule configuration
  - name: Jobs
    description: Scheduled job management
  - name: Webhooks
    description: GHL webhook handlers

security:
  - BearerAuth: []

paths:
  # ==========================================
  # AUTHENTICATION
  # ==========================================
  /auth/oauth/callback:
    get:
      tags: [Authentication]
      summary: OAuth callback from GHL
      description: Handles OAuth redirect from GHL after user authorization
      security: []
      parameters:
        - name: code
          in: query
          required: true
          schema:
            type: string
          description: Authorization code from GHL
        - name: state
          in: query
          schema:
            type: string
          description: CSRF state token
      responses:
        302:
          description: Redirect to app dashboard
          headers:
            Location:
              schema:
                type: string
            Set-Cookie:
              schema:
                type: string
              description: Session cookie
        400:
          $ref: '#/components/responses/BadRequest'

  /auth/session:
    get:
      tags: [Authentication]
      summary: Get current session
      description: Returns current user session and tenant context
      responses:
        200:
          description: Current session
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
        401:
          $ref: '#/components/responses/Unauthorized'

  /auth/logout:
    post:
      tags: [Authentication]
      summary: End session
      responses:
        204:
          description: Session ended

  # ==========================================
  # MATCHES
  # ==========================================
  /matches:
    get:
      tags: [Matches]
      summary: List match pairs
      description: Returns paginated list of detected duplicate matches
      parameters:
        - $ref: '#/components/parameters/LocationId'
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, approved, rejected, merged, auto_merged]
          description: Filter by match status
        - name: object_type
          in: query
          schema:
            type: string
            enum: [contact, company, opportunity, custom]
          description: Filter by object type
        - name: min_confidence
          in: query
          schema:
            type: number
            minimum: 0
            maximum: 1
          description: Minimum confidence score
        - name: sort
          in: query
          schema:
            type: string
            enum: [confidence_desc, confidence_asc, created_desc, created_asc]
            default: confidence_desc
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Cursor'
      responses:
        200:
          description: List of match pairs
          content:
            application/json:
              schema:
                type: object
                required: [data, meta]
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/MatchPair'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
        401:
          $ref: '#/components/responses/Unauthorized'
        403:
          $ref: '#/components/responses/Forbidden'

  /matches/{matchId}:
    get:
      tags: [Matches]
      summary: Get match pair details
      parameters:
        - $ref: '#/components/parameters/MatchId'
      responses:
        200:
          description: Match pair details with full record data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchPairDetail'
        404:
          $ref: '#/components/responses/NotFound'

    patch:
      tags: [Matches]
      summary: Update match pair status
      description: Approve or reject a match pair
      parameters:
        - $ref: '#/components/parameters/MatchId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [approved, rejected]
                rejection_reason:
                  type: string
                  maxLength: 500
                  description: Required when status is 'rejected'
      responses:
        200:
          description: Updated match pair
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchPair'
        400:
          $ref: '#/components/responses/BadRequest'
        404:
          $ref: '#/components/responses/NotFound'
        409:
          $ref: '#/components/responses/Conflict'

  /matches/bulk:
    post:
      tags: [Matches]
      summary: Bulk update match pairs
      description: Approve or reject multiple match pairs at once
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [match_ids, status]
              properties:
                match_ids:
                  type: array
                  items:
                    type: string
                    format: uuid
                  minItems: 1
                  maxItems: 100
                status:
                  type: string
                  enum: [approved, rejected]
      responses:
        200:
          description: Bulk operation result
          content:
            application/json:
              schema:
                type: object
                properties:
                  success_count:
                    type: integer
                  failure_count:
                    type: integer
                  failures:
                    type: array
                    items:
                      type: object
                      properties:
                        match_id:
                          type: string
                        error:
                          type: string

  /matches/scan:
    post:
      tags: [Matches]
      summary: Trigger manual scan
      description: Start a manual duplicate detection scan for specific records or all records
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [location_id]
              properties:
                location_id:
                  type: string
                object_type:
                  type: string
                  enum: [contact, company, opportunity]
                  default: contact
                record_ids:
                  type: array
                  items:
                    type: string
                  maxItems: 100
                  description: Specific records to scan. If empty, scans all records.
                rule_ids:
                  type: array
                  items:
                    type: string
                    format: uuid
                  description: Specific rules to apply. If empty, uses all active rules.
      responses:
        202:
          description: Scan job queued
          content:
            application/json:
              schema:
                type: object
                properties:
                  job_id:
                    type: string
                    format: uuid
                  status:
                    type: string
                    enum: [queued]
                  estimated_records:
                    type: integer
        429:
          $ref: '#/components/responses/RateLimited'

  # ==========================================
  # MERGES
  # ==========================================
  /merges:
    get:
      tags: [Merges]
      summary: List merge history
      parameters:
        - $ref: '#/components/parameters/LocationId'
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed, failed, rolled_back]
        - name: object_type
          in: query
          schema:
            type: string
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Cursor'
      responses:
        200:
          description: List of merges
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Merge'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'

    post:
      tags: [Merges]
      summary: Execute merge
      description: Merge duplicate records
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [match_id]
              properties:
                match_id:
                  type: string
                  format: uuid
                  description: The match pair to merge
                master_record_id:
                  type: string
                  description: Override auto-selected master record
                field_selections:
                  type: object
                  additionalProperties:
                    type: object
                    properties:
                      source:
                        type: string
                        enum: [master, merged, custom]
                      value:
                        type: string
                  description: Override field value selections
                idempotency_key:
                  type: string
                  format: uuid
                  description: Client-generated key to prevent duplicate merges
      responses:
        201:
          description: Merge created and queued
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Merge'
        400:
          $ref: '#/components/responses/BadRequest'
        409:
          description: Merge already in progress or idempotency conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /merges/{mergeId}:
    get:
      tags: [Merges]
      summary: Get merge details
      parameters:
        - $ref: '#/components/parameters/MergeId'
      responses:
        200:
          description: Merge details with snapshots
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MergeDetail'
        404:
          $ref: '#/components/responses/NotFound'

  /merges/{mergeId}/rollback:
    post:
      tags: [Merges]
      summary: Rollback merge
      description: Undo a merge and restore original records
      parameters:
        - $ref: '#/components/parameters/MergeId'
      responses:
        200:
          description: Rollback initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  merge_id:
                    type: string
                  status:
                    type: string
                    enum: [rolling_back]
                  restored_record_ids:
                    type: array
                    items:
                      type: string
        400:
          description: Rollback not possible (expired or already rolled back)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # ==========================================
  # RULES
  # ==========================================
  /rules:
    get:
      tags: [Rules]
      summary: List match rules
      parameters:
        - $ref: '#/components/parameters/LocationId'
        - name: object_type
          in: query
          schema:
            type: string
        - name: is_active
          in: query
          schema:
            type: boolean
      responses:
        200:
          description: List of match rules
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/MatchRule'

    post:
      tags: [Rules]
      summary: Create match rule
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MatchRuleCreate'
      responses:
        201:
          description: Rule created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchRule'
        400:
          $ref: '#/components/responses/BadRequest'

  /rules/{ruleId}:
    get:
      tags: [Rules]
      summary: Get match rule
      parameters:
        - $ref: '#/components/parameters/RuleId'
      responses:
        200:
          description: Match rule details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchRule'
        404:
          $ref: '#/components/responses/NotFound'

    put:
      tags: [Rules]
      summary: Update match rule
      parameters:
        - $ref: '#/components/parameters/RuleId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MatchRuleUpdate'
      responses:
        200:
          description: Rule updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchRule'

    delete:
      tags: [Rules]
      summary: Delete match rule
      parameters:
        - $ref: '#/components/parameters/RuleId'
      responses:
        204:
          description: Rule deleted

  /rules/{ruleId}/test:
    post:
      tags: [Rules]
      summary: Test match rule
      description: Run rule against sample records without saving matches
      parameters:
        - $ref: '#/components/parameters/RuleId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                sample_size:
                  type: integer
                  default: 100
                  maximum: 500
      responses:
        200:
          description: Test results
          content:
            application/json:
              schema:
                type: object
                properties:
                  records_tested:
                    type: integer
                  potential_matches:
                    type: integer
                  sample_matches:
                    type: array
                    maxItems: 10
                    items:
                      $ref: '#/components/schemas/MatchPair'

  # ==========================================
  # JOBS
  # ==========================================
  /jobs:
    get:
      tags: [Jobs]
      summary: List scheduled jobs
      parameters:
        - $ref: '#/components/parameters/LocationId'
        - name: status
          in: query
          schema:
            type: string
            enum: [idle, queued, running, completed, failed]
      responses:
        200:
          description: List of jobs
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Job'

    post:
      tags: [Jobs]
      summary: Create scheduled job
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JobCreate'
      responses:
        201:
          description: Job created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Job'

  /jobs/{jobId}:
    get:
      tags: [Jobs]
      summary: Get job details
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        200:
          description: Job details with run history
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobDetail'

    put:
      tags: [Jobs]
      summary: Update scheduled job
      parameters:
        - $ref: '#/components/parameters/JobId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JobUpdate'
      responses:
        200:
          description: Job updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Job'

    delete:
      tags: [Jobs]
      summary: Delete scheduled job
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        204:
          description: Job deleted

  /jobs/{jobId}/run:
    post:
      tags: [Jobs]
      summary: Trigger job manually
      description: Start a scheduled job immediately
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        202:
          description: Job run started
          content:
            application/json:
              schema:
                type: object
                properties:
                  run_id:
                    type: string
                    format: uuid
                  status:
                    type: string
                    enum: [running]

  /jobs/{jobId}/cancel:
    post:
      tags: [Jobs]
      summary: Cancel running job
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        200:
          description: Job cancelled
        400:
          description: Job not running

  /jobs/runs/{runId}:
    get:
      tags: [Jobs]
      summary: Get job run details
      parameters:
        - name: runId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Job run details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobRun'

  # ==========================================
  # WEBHOOKS (GHL Events)
  # ==========================================
  /webhooks/ghl:
    post:
      tags: [Webhooks]
      summary: GHL webhook receiver
      description: Receives events from GoHighLevel
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                type:
                  type: string
                  enum: [ContactCreate, ContactDelete, ContactTagUpdate,
                         OpportunityCreate, OpportunityUpdate,
                         AppInstall, AppUninstall]
                locationId:
                  type: string
                id:
                  type: string
      responses:
        200:
          description: Webhook processed
        401:
          description: Invalid webhook signature

  # ==========================================
  # DASHBOARD / STATS
  # ==========================================
  /stats/overview:
    get:
      tags: [Dashboard]
      summary: Get dashboard overview stats
      parameters:
        - $ref: '#/components/parameters/LocationId'
        - name: period
          in: query
          schema:
            type: string
            enum: [day, week, month]
            default: month
      responses:
        200:
          description: Overview statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  pending_reviews:
                    type: integer
                  auto_merged_today:
                    type: integer
                  merged_this_period:
                    type: integer
                  total_records_scanned:
                    type: integer
                  confidence_distribution:
                    type: object
                    properties:
                      high:
                        type: integer
                        description: "95-100%"
                      medium:
                        type: integer
                        description: "70-94%"
                      low:
                        type: integer
                        description: "<70%"
                  recent_activity:
                    type: array
                    maxItems: 10
                    items:
                      $ref: '#/components/schemas/ActivityEvent'

# ==========================================
# COMPONENTS
# ==========================================
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    LocationId:
      name: location_id
      in: query
      required: true
      schema:
        type: string
      description: GHL Location ID

    MatchId:
      name: matchId
      in: path
      required: true
      schema:
        type: string
        format: uuid

    MergeId:
      name: mergeId
      in: path
      required: true
      schema:
        type: string
        format: uuid

    RuleId:
      name: ruleId
      in: path
      required: true
      schema:
        type: string
        format: uuid

    JobId:
      name: jobId
      in: path
      required: true
      schema:
        type: string
        format: uuid

    Limit:
      name: limit
      in: query
      schema:
        type: integer
        default: 50
        minimum: 1
        maximum: 100

    Cursor:
      name: cursor
      in: query
      schema:
        type: string
      description: Pagination cursor for next page

  schemas:
    # ---- Core Entities ----
    MatchPair:
      type: object
      required: [id, record_a, record_b, confidence_score, status]
      properties:
        id:
          type: string
          format: uuid
        location_id:
          type: string
        match_rule_id:
          type: string
          format: uuid
        record_a:
          $ref: '#/components/schemas/RecordSummary'
        record_b:
          $ref: '#/components/schemas/RecordSummary'
        confidence_score:
          type: number
          minimum: 0
          maximum: 1
          description: Overall match confidence (0.0 to 1.0)
        field_scores:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/FieldScore'
        status:
          type: string
          enum: [pending, approved, rejected, merged, auto_merged, merge_failed]
        detected_by:
          type: string
          enum: [webhook, scheduled_job, manual_scan]
        created_at:
          type: string
          format: date-time
        reviewed_at:
          type: string
          format: date-time
        reviewed_by:
          type: string

    MatchPairDetail:
      allOf:
        - $ref: '#/components/schemas/MatchPair'
        - type: object
          properties:
            record_a_full:
              type: object
              description: Complete record data from GHL
            record_b_full:
              type: object
              description: Complete record data from GHL
            suggested_master:
              type: string
              enum: [record_a, record_b]
            suggested_master_reason:
              type: string
            merge_preview:
              type: object
              description: Preview of merged field values

    RecordSummary:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [contact, company, opportunity, custom]
        display_name:
          type: string
        email:
          type: string
        phone:
          type: string
        company_name:
          type: string
        created_at:
          type: string
          format: date-time

    FieldScore:
      type: object
      properties:
        score:
          type: number
          minimum: 0
          maximum: 1
        match_type:
          type: string
          enum: [exact, fuzzy, phonetic, domain, normalized]
        value_a:
          type: string
        value_b:
          type: string

    Merge:
      type: object
      properties:
        id:
          type: string
          format: uuid
        location_id:
          type: string
        match_pair_id:
          type: string
          format: uuid
        master_record_id:
          type: string
        master_record_type:
          type: string
        merged_record_ids:
          type: array
          items:
            type: string
        status:
          type: string
          enum: [pending, in_progress, completed, failed, rolled_back]
        executed_at:
          type: string
          format: date-time
        executed_by:
          type: string
        can_rollback:
          type: boolean
        rollback_expires_at:
          type: string
          format: date-time
        error_message:
          type: string
        created_at:
          type: string
          format: date-time

    MergeDetail:
      allOf:
        - $ref: '#/components/schemas/Merge'
        - type: object
          properties:
            field_selections:
              type: object
              additionalProperties:
                type: object
                properties:
                  source:
                    type: string
                  value:
                    type: string
            snapshots:
              type: array
              items:
                type: object
                properties:
                  record_id:
                    type: string
                  record_type:
                    type: string
                  is_master:
                    type: boolean
                  snapshot_data:
                    type: object

    MatchRule:
      type: object
      properties:
        id:
          type: string
          format: uuid
        tenant_id:
          type: string
          format: uuid
        location_id:
          type: string
          nullable: true
          description: NULL means tenant-wide default
        name:
          type: string
        description:
          type: string
        source_object:
          type: string
          enum: [contact, company, opportunity, custom]
        target_object:
          type: string
          nullable: true
        match_fields:
          type: array
          items:
            $ref: '#/components/schemas/MatchFieldConfig'
        auto_merge_threshold:
          type: number
          minimum: 0
          maximum: 1
          default: 0.95
        review_threshold:
          type: number
          minimum: 0
          maximum: 1
          default: 0.70
        master_selection_strategy:
          type: string
          enum: [most_complete, oldest, newest, most_recent_activity, custom]
        master_selection_rules:
          type: object
          nullable: true
        is_active:
          type: boolean
        priority:
          type: integer
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    MatchRuleCreate:
      type: object
      required: [name, source_object, match_fields]
      properties:
        location_id:
          type: string
        name:
          type: string
          maxLength: 255
        description:
          type: string
          maxLength: 1000
        source_object:
          type: string
        target_object:
          type: string
        match_fields:
          type: array
          minItems: 1
          items:
            $ref: '#/components/schemas/MatchFieldConfig'
        auto_merge_threshold:
          type: number
          default: 0.95
        review_threshold:
          type: number
          default: 0.70
        master_selection_strategy:
          type: string
          default: most_complete
        is_active:
          type: boolean
          default: true

    MatchRuleUpdate:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        match_fields:
          type: array
          items:
            $ref: '#/components/schemas/MatchFieldConfig'
        auto_merge_threshold:
          type: number
        review_threshold:
          type: number
        master_selection_strategy:
          type: string
        is_active:
          type: boolean

    MatchFieldConfig:
      type: object
      required: [source_field, match_type, weight]
      properties:
        source_field:
          type: string
        target_field:
          type: string
          description: Defaults to source_field if not specified
        match_type:
          type: string
          enum: [exact, exact_normalized, fuzzy, fuzzy_levenshtein,
                 domain, phonetic, phone_normalized, address_normalized]
        threshold:
          type: number
          minimum: 0
          maximum: 1
          default: 0.85
          description: Minimum score for fuzzy matches
        weight:
          type: number
          minimum: 0
          maximum: 1
          description: Weight in composite score (all weights should sum to 1.0)
        required:
          type: boolean
          default: false
          description: If true, non-match on this field disqualifies the pair

    Job:
      type: object
      properties:
        id:
          type: string
          format: uuid
        location_id:
          type: string
        name:
          type: string
        job_type:
          type: string
          enum: [full_scan, incremental, object_scan, rule_test]
        object_types:
          type: array
          items:
            type: string
        match_rule_ids:
          type: array
          items:
            type: string
            format: uuid
        schedule_type:
          type: string
          enum: [manual, hourly, daily, weekly, custom]
        schedule_cron:
          type: string
        next_run_at:
          type: string
          format: date-time
        last_run_at:
          type: string
          format: date-time
        status:
          type: string
          enum: [idle, queued, running, paused, completed, failed]
        is_active:
          type: boolean
        created_at:
          type: string
          format: date-time

    JobCreate:
      type: object
      required: [location_id, name, job_type, schedule_type]
      properties:
        location_id:
          type: string
        name:
          type: string
        job_type:
          type: string
        object_types:
          type: array
          items:
            type: string
        match_rule_ids:
          type: array
          items:
            type: string
        schedule_type:
          type: string
        schedule_cron:
          type: string
          description: Required if schedule_type is 'custom'
        is_active:
          type: boolean
          default: true

    JobUpdate:
      type: object
      properties:
        name:
          type: string
        object_types:
          type: array
          items:
            type: string
        schedule_type:
          type: string
        schedule_cron:
          type: string
        is_active:
          type: boolean

    JobDetail:
      allOf:
        - $ref: '#/components/schemas/Job'
        - type: object
          properties:
            recent_runs:
              type: array
              maxItems: 10
              items:
                $ref: '#/components/schemas/JobRun'

    JobRun:
      type: object
      properties:
        id:
          type: string
          format: uuid
        job_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [running, completed, failed, cancelled]
        progress_percent:
          type: integer
          minimum: 0
          maximum: 100
        current_phase:
          type: string
          enum: [fetching_records, matching, scoring, saving]
        records_scanned:
          type: integer
        matches_found:
          type: integer
        auto_merges:
          type: integer
        pending_reviews:
          type: integer
        errors:
          type: integer
        processing_time_ms:
          type: integer
        started_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time
        error_log:
          type: array
          items:
            type: object
            properties:
              timestamp:
                type: string
              message:
                type: string
              record_id:
                type: string

    Session:
      type: object
      properties:
        user_id:
          type: string
        tenant_id:
          type: string
          format: uuid
        tenant_name:
          type: string
        location_id:
          type: string
        location_name:
          type: string
        ghl_user_type:
          type: string
          enum: [Company, Location]
        plan:
          type: string
        permissions:
          type: array
          items:
            type: string
        expires_at:
          type: string
          format: date-time

    ActivityEvent:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [match_detected, match_approved, match_rejected,
                 merge_completed, merge_failed, merge_rolled_back,
                 job_started, job_completed, job_failed]
        description:
          type: string
        entity_type:
          type: string
        entity_id:
          type: string
        confidence_score:
          type: number
        timestamp:
          type: string
          format: date-time

    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code:
              type: string
              description: Machine-readable error code (e.g., FM-1001)
            message:
              type: string
              description: Human-readable error message
            details:
              type: object
              description: Additional error context
            request_id:
              type: string
              format: uuid
              description: Request ID for support reference

    PaginationMeta:
      type: object
      properties:
        total:
          type: integer
        limit:
          type: integer
        has_more:
          type: boolean
        next_cursor:
          type: string
          nullable: true

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "FM-2001"
              message: "Invalid request body"
              details:
                field: "match_fields"
                reason: "At least one match field is required"

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "FM-1001"
              message: "Token expired"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "FM-1004"
              message: "Insufficient permissions for this location"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "FM-4001"
              message: "Match pair not found"

    Conflict:
      description: Conflict with current state
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "FM-4002"
              message: "Merge already in progress for this match pair"

    RateLimited:
      description: Too many requests
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
        X-RateLimit-Remaining:
          schema:
            type: integer
        X-RateLimit-Reset:
          schema:
            type: integer
            description: Unix timestamp when limit resets
        Retry-After:
          schema:
            type: integer
            description: Seconds to wait before retrying
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "FM-5003"
              message: "Rate limit exceeded"
              details:
                retry_after: 30
```

## 1.3 API Conventions

### Pagination
All list endpoints use cursor-based pagination:
```json
{
  "data": [...],
  "meta": {
    "total": 234,
    "limit": 50,
    "has_more": true,
    "next_cursor": "eyJpZCI6IjEyMzQ1Njc4OTAifQ=="
  }
}
```

### Filtering
- Query parameters for simple filters: `?status=pending&object_type=contact`
- Comma-separated for multiple values: `?status=pending,approved`

### Sorting
- `sort` parameter with format: `field_direction`
- Example: `?sort=confidence_desc`

### Error Response Format
All errors follow the structure:
```json
{
  "error": {
    "code": "FM-XXXX",
    "message": "Human readable message",
    "details": { },
    "request_id": "uuid"
  }
}
```

### Rate Limiting Headers
All responses include:
- `X-RateLimit-Limit`: Requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when window resets

---

# 2. TESTING STRATEGY

## 2.1 Testing Pyramid

```
                    ┌─────────────────────┐
                    │   E2E Tests (10%)   │
                    │   Playwright        │
                    │   Critical paths    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │     Integration Tests (30%)     │
              │     pytest + testcontainers     │
              │     API + DB + GHL mocks        │
              └────────────────┬────────────────┘
                               │
    ┌──────────────────────────┴──────────────────────────┐
    │                  Unit Tests (60%)                    │
    │                  pytest + pytest-cov                 │
    │         Matching algorithms, scoring, logic          │
    └──────────────────────────────────────────────────────┘
```

## 2.2 Coverage Targets

| Component | Target | Rationale |
|-----------|--------|-----------|
| **Overall** | 80% | Industry standard |
| **Matching Engine** | 95% | Core business logic, must be bulletproof |
| **Merge Execution** | 95% | Data integrity critical |
| **API Routes** | 80% | Standard CRUD operations |
| **GHL Client** | 70% | Heavy mocking, test integration separately |
| **Frontend** | 70% | UI testing has diminishing returns |

## 2.3 Unit Test Specifications

### Matching Engine Tests
```python
# tests/unit/matching/test_comparators.py

class TestExactMatch:
    def test_exact_match_identical(self):
        """Identical strings should return 1.0"""
        assert exact_match("john@acme.com", "john@acme.com") == 1.0

    def test_exact_match_different(self):
        """Different strings should return 0.0"""
        assert exact_match("john@acme.com", "jane@acme.com") == 0.0

    def test_exact_match_null_handling(self):
        """Null values should return 0.0"""
        assert exact_match(None, "john@acme.com") == 0.0
        assert exact_match("john@acme.com", None) == 0.0
        assert exact_match(None, None) == 0.0

class TestFuzzyMatch:
    def test_fuzzy_match_similar_names(self):
        """Similar names should have high score"""
        score = fuzzy_match("John Smith", "Jon Smith")
        assert 0.85 <= score <= 0.95

    def test_fuzzy_match_different_names(self):
        """Different names should have low score"""
        score = fuzzy_match("John Smith", "Jane Doe")
        assert score < 0.5

    @pytest.mark.parametrize("input_a,input_b,expected_range", [
        ("Acme Inc", "Acme Incorporated", (0.75, 0.90)),
        ("ABC Company", "ABC Co.", (0.70, 0.85)),
        ("McDonald's", "McDonalds", (0.90, 1.0)),
    ])
    def test_fuzzy_match_company_variations(self, input_a, input_b, expected_range):
        score = fuzzy_match(input_a, input_b)
        assert expected_range[0] <= score <= expected_range[1]

class TestPhoneNormalization:
    @pytest.mark.parametrize("input_phone,expected", [
        ("(555) 123-4567", "5551234567"),
        ("+1-555-123-4567", "15551234567"),
        ("555.123.4567", "5551234567"),
        ("+44 20 7946 0958", "442079460958"),
        ("", None),
        ("N/A", None),
        ("TBD", None),
    ])
    def test_phone_normalization(self, input_phone, expected):
        assert normalize_phone(input_phone) == expected

class TestEmailDomainExtraction:
    @pytest.mark.parametrize("email,expected_domain", [
        ("john@acme.com", "acme.com"),
        ("john+sales@gmail.com", "gmail.com"),
        ("JOHN@ACME.COM", "acme.com"),
        ("", None),
        (None, None),
        ("invalid-email", None),
    ])
    def test_domain_extraction(self, email, expected_domain):
        assert extract_domain(email) == expected_domain
```

### Scoring Tests
```python
# tests/unit/matching/test_scoring.py

class TestCompositeScoring:
    def test_weighted_score_calculation(self):
        """Verify weighted composite score calculation"""
        field_scores = {
            "email": {"score": 1.0, "weight": 0.4},
            "name": {"score": 0.9, "weight": 0.3},
            "company": {"score": 0.8, "weight": 0.2},
            "phone": {"score": 0.0, "weight": 0.1},
        }
        # Expected: 1.0*0.4 + 0.9*0.3 + 0.8*0.2 + 0.0*0.1 = 0.83
        assert calculate_composite_score(field_scores) == pytest.approx(0.83)

    def test_weight_redistribution_on_null(self):
        """When field is null, weight should redistribute"""
        field_scores = {
            "email": {"score": 1.0, "weight": 0.5, "value_a": "a@b.com", "value_b": "a@b.com"},
            "phone": {"score": None, "weight": 0.5, "value_a": None, "value_b": "555-1234"},
        }
        # Phone is null, so email gets full weight
        assert calculate_composite_score(field_scores) == pytest.approx(1.0)

    def test_required_field_failure(self):
        """If required field doesn't match, overall score should be 0"""
        field_scores = {
            "email": {"score": 0.0, "weight": 0.4, "required": True},
            "name": {"score": 1.0, "weight": 0.6, "required": False},
        }
        assert calculate_composite_score(field_scores) == 0.0
```

### Master Selection Tests
```python
# tests/unit/matching/test_master_selection.py

class TestMasterSelection:
    def test_most_complete_strategy(self):
        """Record with most non-null fields wins"""
        record_a = {"email": "a@b.com", "phone": "555-1234", "name": "John"}
        record_b = {"email": "a@b.com", "phone": None, "name": "John"}

        master = select_master(record_a, record_b, strategy="most_complete")
        assert master == record_a

    def test_oldest_strategy(self):
        """Oldest created record wins"""
        record_a = {"id": "1", "dateAdded": "2024-01-01T00:00:00Z"}
        record_b = {"id": "2", "dateAdded": "2024-06-01T00:00:00Z"}

        master = select_master(record_a, record_b, strategy="oldest")
        assert master == record_a

    def test_tiebreaker(self):
        """When tie on primary strategy, use tiebreaker"""
        record_a = {"email": "a@b.com", "dateAdded": "2024-06-01T00:00:00Z"}
        record_b = {"email": "a@b.com", "dateAdded": "2024-01-01T00:00:00Z"}

        master = select_master(
            record_a, record_b,
            strategy="most_complete",
            tiebreaker="oldest"
        )
        assert master == record_b
```

## 2.4 Integration Test Specifications

### API Endpoint Tests
```python
# tests/integration/api/test_matches.py

@pytest.fixture
def test_client(db_session):
    """Create test client with authenticated session"""
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app)

@pytest.fixture
def auth_headers(test_tenant):
    """Generate auth headers for test tenant"""
    token = create_test_token(tenant_id=test_tenant.id)
    return {"Authorization": f"Bearer {token}"}

class TestMatchesEndpoint:
    def test_list_matches_empty(self, test_client, auth_headers):
        """Empty location returns empty list"""
        response = test_client.get(
            "/v1/matches?location_id=test-loc-1",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["data"] == []

    def test_list_matches_filtered(self, test_client, auth_headers, seed_matches):
        """Filter by status works correctly"""
        response = test_client.get(
            "/v1/matches?location_id=test-loc-1&status=pending",
            headers=auth_headers
        )
        assert response.status_code == 200
        for match in response.json()["data"]:
            assert match["status"] == "pending"

    def test_approve_match(self, test_client, auth_headers, seed_matches):
        """Approving match updates status"""
        match_id = seed_matches[0].id
        response = test_client.patch(
            f"/v1/matches/{match_id}",
            json={"status": "approved"},
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["status"] == "approved"

    def test_reject_match_requires_reason(self, test_client, auth_headers, seed_matches):
        """Rejecting without reason fails"""
        match_id = seed_matches[0].id
        response = test_client.patch(
            f"/v1/matches/{match_id}",
            json={"status": "rejected"},
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "rejection_reason" in response.json()["error"]["message"]

    def test_tenant_isolation(self, test_client, other_tenant_headers, seed_matches):
        """Cannot access other tenant's matches"""
        match_id = seed_matches[0].id
        response = test_client.get(
            f"/v1/matches/{match_id}",
            headers=other_tenant_headers
        )
        assert response.status_code == 404
```

### Database Integration Tests
```python
# tests/integration/db/test_match_pairs.py

class TestMatchPairRepository:
    def test_create_match_pair(self, db_session, test_tenant, test_location):
        """Can create and retrieve match pair"""
        repo = MatchPairRepository(db_session)

        match = repo.create(
            tenant_id=test_tenant.id,
            location_id=test_location.id,
            record_a_id="contact-1",
            record_a_type="contact",
            record_b_id="contact-2",
            record_b_type="contact",
            confidence_score=0.87,
        )

        retrieved = repo.get_by_id(match.id)
        assert retrieved.confidence_score == 0.87

    def test_unique_constraint_on_pair(self, db_session, test_location):
        """Cannot create duplicate pair for same records"""
        repo = MatchPairRepository(db_session)

        repo.create(location_id=test_location.id, record_a_id="1", record_b_id="2", ...)

        with pytest.raises(IntegrityError):
            repo.create(location_id=test_location.id, record_a_id="1", record_b_id="2", ...)
```

### GHL API Mock Tests
```python
# tests/integration/ghl/test_ghl_client.py

@pytest.fixture
def mock_ghl_responses():
    """Mock GHL API responses using responses library"""
    with responses.RequestsMock() as rsps:
        yield rsps

class TestGHLClient:
    def test_get_contact(self, mock_ghl_responses, ghl_client):
        """Can retrieve contact from GHL"""
        mock_ghl_responses.add(
            responses.GET,
            "https://services.leadconnectorhq.com/contacts/contact-123",
            json={
                "contact": {
                    "id": "contact-123",
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@acme.com"
                }
            },
            status=200
        )

        contact = ghl_client.get_contact("contact-123")
        assert contact["email"] == "john@acme.com"

    def test_rate_limit_handling(self, mock_ghl_responses, ghl_client):
        """Handles 429 with retry"""
        mock_ghl_responses.add(
            responses.GET,
            "https://services.leadconnectorhq.com/contacts/contact-123",
            status=429,
            headers={"Retry-After": "1"}
        )
        mock_ghl_responses.add(
            responses.GET,
            "https://services.leadconnectorhq.com/contacts/contact-123",
            json={"contact": {"id": "contact-123"}},
            status=200
        )

        contact = ghl_client.get_contact("contact-123")
        assert contact["id"] == "contact-123"
        assert len(mock_ghl_responses.calls) == 2

    def test_token_refresh_on_401(self, mock_ghl_responses, ghl_client):
        """Refreshes token on 401 and retries"""
        mock_ghl_responses.add(
            responses.GET,
            "https://services.leadconnectorhq.com/contacts/contact-123",
            status=401
        )
        mock_ghl_responses.add(
            responses.POST,
            "https://services.leadconnectorhq.com/oauth/token",
            json={"access_token": "new-token", "refresh_token": "new-refresh"},
            status=200
        )
        mock_ghl_responses.add(
            responses.GET,
            "https://services.leadconnectorhq.com/contacts/contact-123",
            json={"contact": {"id": "contact-123"}},
            status=200
        )

        contact = ghl_client.get_contact("contact-123")
        assert contact["id"] == "contact-123"
```

## 2.5 E2E Test Specifications

```typescript
// tests/e2e/flows/duplicate-review.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Duplicate Review Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login via GHL OAuth mock
    await page.goto('/auth/test-login?tenant=test-tenant-1');
  });

  test('can view and approve duplicate', async ({ page }) => {
    // Navigate to duplicates queue
    await page.goto('/duplicates');
    await expect(page.getByText('Pending Review')).toBeVisible();

    // Click first match
    const firstMatch = page.locator('[data-testid="match-card"]').first();
    await firstMatch.click();

    // Verify merge preview modal
    await expect(page.getByText('Merge Preview')).toBeVisible();
    await expect(page.getByText('Record A')).toBeVisible();
    await expect(page.getByText('Record B')).toBeVisible();

    // Approve the merge
    await page.getByRole('button', { name: 'Confirm Merge' }).click();

    // Verify success
    await expect(page.getByText('Merge completed')).toBeVisible();
  });

  test('can reject duplicate with reason', async ({ page }) => {
    await page.goto('/duplicates');

    const firstMatch = page.locator('[data-testid="match-card"]').first();
    await firstMatch.getByRole('button', { name: 'Not a Duplicate' }).click();

    // Modal requires reason
    const reasonInput = page.getByPlaceholder('Why is this not a duplicate?');
    await reasonInput.fill('Different people with same name');
    await page.getByRole('button', { name: 'Confirm Rejection' }).click();

    // Verify removed from queue
    await expect(firstMatch).not.toBeVisible();
  });

  test('can bulk approve matches', async ({ page }) => {
    await page.goto('/duplicates');

    // Select multiple
    await page.getByLabel('Select All').check();
    await page.getByRole('button', { name: 'Merge Selected' }).click();

    // Confirm bulk action
    await page.getByRole('button', { name: 'Confirm Bulk Merge' }).click();

    await expect(page.getByText('5 merges completed')).toBeVisible();
  });
});

test.describe('Match Rule Configuration', () => {
  test('can create new match rule', async ({ page }) => {
    await page.goto('/rules');
    await page.getByRole('button', { name: 'New Rule' }).click();

    // Fill form
    await page.getByLabel('Rule Name').fill('Email + Name Match');
    await page.getByLabel('Source Object').selectOption('contact');

    // Add email field
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByLabel('Source Field').selectOption('email');
    await page.getByLabel('Match Type').selectOption('exact');
    await page.getByLabel('Weight').fill('0.6');
    await page.getByLabel('Required').check();

    // Add name field
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.locator('[data-field-index="1"]').getByLabel('Source Field').selectOption('name');
    await page.locator('[data-field-index="1"]').getByLabel('Match Type').selectOption('fuzzy');
    await page.locator('[data-field-index="1"]').getByLabel('Weight').fill('0.4');

    // Save
    await page.getByRole('button', { name: 'Save Rule' }).click();

    await expect(page.getByText('Rule created successfully')).toBeVisible();
  });

  test('can test rule before saving', async ({ page }) => {
    await page.goto('/rules/rule-123/edit');
    await page.getByRole('button', { name: 'Test Rule' }).click();

    // Wait for test results
    await expect(page.getByText('Test Results')).toBeVisible();
    await expect(page.getByText('Records Tested:')).toBeVisible();
    await expect(page.getByText('Potential Matches:')).toBeVisible();
  });
});
```

## 2.6 Test Data Strategy

### Fixtures
```python
# tests/fixtures/contacts.py

SAMPLE_CONTACTS = [
    # Exact duplicates
    {
        "id": "contact-1a",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john.smith@acme.com",
        "phone": "+1-555-123-4567",
        "companyName": "Acme Inc"
    },
    {
        "id": "contact-1b",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john.smith@acme.com",
        "phone": "(555) 123-4567",
        "companyName": "Acme Incorporated"
    },

    # Fuzzy duplicates
    {
        "id": "contact-2a",
        "firstName": "Jon",  # Typo
        "lastName": "Smith",
        "email": "jsmith@acme.com",
        "phone": "5551234567"
    },

    # Non-duplicates with similar data
    {
        "id": "contact-3a",
        "firstName": "John",
        "lastName": "Smith",  # Same name
        "email": "john.smith@different.com",  # Different email
        "companyName": "Different Corp"
    },

    # Edge cases
    {
        "id": "contact-4a",
        "firstName": "José",  # Unicode
        "lastName": "García",
        "email": "jose@company.com"
    },
    {
        "id": "contact-4b",
        "firstName": "Jose",  # Without accents
        "lastName": "Garcia",
        "email": "jose@company.com"
    },
]
```

### Database Seeders
```python
# tests/fixtures/seeders.py

@pytest.fixture
def seed_matches(db_session, test_tenant, test_location):
    """Seed test database with match pairs"""
    matches = []
    for i, (a, b) in enumerate(DUPLICATE_PAIRS):
        match = MatchPair(
            tenant_id=test_tenant.id,
            location_id=test_location.id,
            record_a_id=a["id"],
            record_a_type="contact",
            record_b_id=b["id"],
            record_b_type="contact",
            confidence_score=0.85 + (i * 0.02),
            status="pending"
        )
        db_session.add(match)
        matches.append(match)
    db_session.commit()
    return matches
```

## 2.7 CI/CD Test Pipeline

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements-dev.txt
      - name: Run unit tests
        run: pytest tests/unit -v --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements-dev.txt
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:test@localhost/test
          REDIS_URL: redis://localhost:6379
        run: pytest tests/integration -v

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Start services
        run: docker-compose -f docker-compose.test.yml up -d
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 2.8 Load Testing

### k6 Load Test Scripts

```javascript
// tests/load/scan-workflow.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const scanDuration = new Trend('scan_duration');

export const options = {
  scenarios: {
    // Simulate normal usage
    steady_state: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m',
    },
    // Simulate peak load
    spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 100 },  // Ramp up
        { duration: '5m', target: 100 },  // Stay at peak
        { duration: '2m', target: 10 },   // Ramp down
      ],
      startTime: '10m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% < 500ms, 99% < 1s
    errors: ['rate<0.01'],                           // Error rate < 1%
    scan_duration: ['p(95)<30000'],                  // Scans complete < 30s
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging-api.mergematch.app';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export function setup() {
  // Create test location for load test
  const res = http.post(
    `${BASE_URL}/v1/test/setup`,
    JSON.stringify({ contacts: 1000 }),
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
  );
  return { locationId: JSON.parse(res.body).location_id };
}

export default function (data) {
  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // 1. List matches (most common operation)
  const listRes = http.get(
    `${BASE_URL}/v1/matches?location_id=${data.locationId}&limit=50`,
    { headers }
  );
  check(listRes, {
    'list matches status 200': (r) => r.status === 200,
    'list matches < 200ms': (r) => r.timings.duration < 200,
  });
  errorRate.add(listRes.status !== 200);

  sleep(1);

  // 2. Trigger scan (less frequent)
  if (Math.random() < 0.1) {  // 10% of iterations
    const scanStart = Date.now();
    const scanRes = http.post(
      `${BASE_URL}/v1/jobs`,
      JSON.stringify({
        location_id: data.locationId,
        job_type: 'scan',
        object_types: ['contact'],
      }),
      { headers }
    );

    if (scanRes.status === 201) {
      const jobId = JSON.parse(scanRes.body).id;
      // Poll for completion
      let complete = false;
      let attempts = 0;
      while (!complete && attempts < 30) {
        sleep(1);
        const statusRes = http.get(`${BASE_URL}/v1/jobs/${jobId}`, { headers });
        const status = JSON.parse(statusRes.body).status;
        complete = status === 'completed' || status === 'failed';
        attempts++;
      }
      scanDuration.add(Date.now() - scanStart);
    }
  }

  // 3. Approve/reject match
  if (Math.random() < 0.2) {  // 20% of iterations
    const matchRes = http.get(
      `${BASE_URL}/v1/matches?location_id=${data.locationId}&status=pending&limit=1`,
      { headers }
    );
    const matches = JSON.parse(matchRes.body).data;
    if (matches.length > 0) {
      http.patch(
        `${BASE_URL}/v1/matches/${matches[0].id}`,
        JSON.stringify({ status: Math.random() < 0.8 ? 'approved' : 'rejected' }),
        { headers }
      );
    }
  }

  sleep(Math.random() * 2);
}

export function teardown(data) {
  http.post(`${BASE_URL}/v1/test/cleanup`, JSON.stringify(data), {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });
}
```

### Load Test Scenarios

| Scenario | VUs | Duration | Target | Pass Criteria |
|----------|-----|----------|--------|---------------|
| **Baseline** | 10 | 5m | Establish metrics | Record p50, p95, p99 |
| **Normal Load** | 50 | 10m | Typical usage | p95 < 500ms, 0% errors |
| **Peak Load** | 100 | 15m | Black Friday | p95 < 1000ms, < 1% errors |
| **Stress Test** | 200 | 10m | Find breaking point | Document degradation |
| **Soak Test** | 50 | 4h | Memory leaks | No degradation over time |

### Running Load Tests

```bash
# Run locally against staging
k6 run tests/load/scan-workflow.js \
  -e BASE_URL=https://staging-api.mergematch.app \
  -e AUTH_TOKEN=$STAGING_TOKEN

# Run in CI with Grafana Cloud k6
k6 cloud tests/load/scan-workflow.js
```

## 2.9 Security Testing

See **Section 4.11** for detailed SAST/DAST integration. Summary:

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Bandit** | Python SAST | CI pipeline, blocks on HIGH |
| **Semgrep** | Pattern-based security | CI pipeline |
| **Trivy** | Container vulnerabilities | CI pipeline |
| **pip-audit** | Dependency vulnerabilities | Weekly + PR |
| **OWASP ZAP** | Dynamic API scanning | Nightly in staging |

### Security Test CI Job

```yaml
# Part of .github/workflows/ci.yml
security-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Run Bandit
      run: |
        pip install bandit
        bandit -r app/ -ll -f json -o bandit-report.json
      continue-on-error: true

    - name: Run Semgrep
      uses: returntocorp/semgrep-action@v1
      with:
        config: p/security-audit

    - name: Upload security report
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: bandit-report.json
```

## 2.10 Chaos Engineering

### Fault Injection Experiments

```python
# tests/chaos/fault_injection.py
"""
Chaos engineering experiments for MergeMatch.
Run in staging only with proper safeguards.
"""

import asyncio
import random
from datetime import timedelta

class ChaosExperiments:
    """Fault injection scenarios"""

    def __init__(self, target_service: str):
        self.target = target_service

    async def network_latency(self, latency_ms: int = 500, duration_s: int = 60):
        """
        Inject network latency between services.
        Validates: Circuit breakers, timeouts, retry logic
        """
        # Using Toxiproxy or tc (traffic control)
        print(f"Injecting {latency_ms}ms latency for {duration_s}s")
        # tc qdisc add dev eth0 root netem delay 500ms

    async def database_slowdown(self, slow_query_pct: float = 0.3):
        """
        Slow down database queries randomly.
        Validates: Connection pool, query timeouts
        """
        # Inject via pg_sleep or middleware

    async def ghl_api_failure(self, failure_rate: float = 0.5, duration_s: int = 120):
        """
        Simulate GHL API failures/timeouts.
        Validates: Retry logic, circuit breaker, graceful degradation
        """
        print(f"GHL API failing at {failure_rate*100}% rate for {duration_s}s")

    async def redis_disconnect(self, duration_s: int = 30):
        """
        Kill Redis connection briefly.
        Validates: Cache miss handling, job queue failover
        """
        pass

    async def memory_pressure(self, target_mb: int = 512):
        """
        Consume memory to test OOM handling.
        Validates: Graceful degradation, container limits
        """
        pass
```

### Chaos Experiment Runbook

```markdown
## Chaos Test: GHL API Outage

**Hypothesis**: When GHL API returns 500 errors for 2 minutes,
MergeMatch should queue operations and retry without data loss.

**Steady State**:
- Match list API responds < 200ms
- Scan jobs complete successfully
- Error rate < 0.1%

**Experiment**:
1. Enable fault injection proxy
2. Configure 100% 500 errors for GHL endpoints
3. Run for 2 minutes
4. Disable fault injection

**Expected Behavior**:
- Match list continues working (cached data)
- Scan jobs fail gracefully with FM-2004 error
- Jobs auto-retry when GHL recovers
- No data corruption or loss

**Abort Conditions**:
- Database connection pool exhausted
- Error rate > 50% on non-GHL endpoints
- Memory usage > 90%

**Rollback**:
- Disable fault proxy immediately
- Verify service recovery within 60s
```

### GameDay Schedule

| Quarter | Experiment | Blast Radius | Duration |
|---------|-----------|--------------|----------|
| Q1 | GHL API timeout (30s) | Staging | 1 hour |
| Q2 | Database failover | Staging | 2 hours |
| Q3 | Redis cluster failure | Staging | 1 hour |
| Q4 | Full region failover | Staging → Prod | 4 hours |

---

# 3. DEVOPS & INFRASTRUCTURE

## 3.1 Production Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INTERNET                                                                  │
│      │                                                                      │
│      ▼                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         ROUTE 53                                     │  │
│   │   mergematch.app → CloudFront                                          │  │
│   │   api.mergematch.app → ALB                                             │  │
│   └──────────────────────────┬──────────────────────────────────────────┘  │
│                              │                                              │
│          ┌───────────────────┴───────────────────┐                         │
│          ▼                                       ▼                         │
│   ┌─────────────────┐                    ┌─────────────────┐               │
│   │   CLOUDFRONT    │                    │       ALB       │               │
│   │   (Frontend)    │                    │   (API + WH)    │               │
│   │                 │                    │                 │               │
│   │ • S3 origin     │                    │ • HTTPS only    │               │
│   │ • Gzip/Brotli   │                    │ • WAF enabled   │               │
│   │ • Cache 24h     │                    │ • Health checks │               │
│   └────────┬────────┘                    └────────┬────────┘               │
│            │                                      │                         │
│            ▼                                      ▼                         │
│   ┌─────────────────┐            ┌────────────────────────────────────┐   │
│   │    S3 BUCKET    │            │         ECS FARGATE CLUSTER        │   │
│   │  (Static Files) │            │                                    │   │
│   │                 │            │  ┌──────────┐  ┌──────────┐       │   │
│   │ • React build   │            │  │ API SVC  │  │ API SVC  │ ...   │   │
│   │ • Assets        │            │  │ (Task)   │  │ (Task)   │       │   │
│   └─────────────────┘            │  └──────────┘  └──────────┘       │   │
│                                  │       │              │             │   │
│                                  │  ┌──────────┐  ┌──────────┐       │   │
│                                  │  │ WORKER   │  │ WORKER   │       │   │
│                                  │  │ (Celery) │  │ (Celery) │       │   │
│                                  │  └──────────┘  └──────────┘       │   │
│                                  │       │                            │   │
│                                  │  ┌──────────┐                     │   │
│                                  │  │  BEAT    │ (1 instance only)   │   │
│                                  │  │(Scheduler│                     │   │
│                                  │  └──────────┘                     │   │
│                                  └────────────────────────────────────┘   │
│                                               │                            │
│                    ┌──────────────────────────┼──────────────────────────┐│
│                    ▼                          ▼                          ▼│
│           ┌─────────────────┐       ┌─────────────────┐      ┌───────────┐│
│           │  RDS PostgreSQL │       │   ELASTICACHE   │      │    SQS    ││
│           │                 │       │     (Redis)     │      │  (DLQ)    ││
│           │ • Multi-AZ      │       │                 │      │           ││
│           │ • db.r6g.large  │       │ • cache.r6g.lg  │      │ • Failed  ││
│           │ • 100GB gp3     │       │ • 2 nodes       │      │   jobs    ││
│           │ • Auto backup   │       │ • Cluster mode  │      │           ││
│           └─────────────────┘       └─────────────────┘      └───────────┘│
│                                                                            │
│   ┌────────────────────────────────────────────────────────────────────┐  │
│   │                        MONITORING & SECURITY                        │  │
│   │                                                                     │  │
│   │  CloudWatch        Secrets Manager       WAF          GuardDuty    │  │
│   │  • Logs            • DB creds            • Rate limit • Threat     │  │
│   │  • Metrics         • OAuth secrets       • SQL inject   detection  │  │
│   │  • Alarms          • Encryption keys     • XSS block              │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Environment Strategy

| Environment | Purpose | Infrastructure | Data |
|-------------|---------|----------------|------|
| **local** | Development | Docker Compose | Seed data |
| **dev** | Integration testing | Single-instance ECS | Synthetic data |
| **staging** | Pre-production | Production-like (smaller) | Anonymized prod copy |
| **production** | Live | Full HA setup | Real data |

### Environment Variables by Stage
```bash
# .env.staging
ENVIRONMENT=staging
DATABASE_URL=postgresql://...staging-db...
REDIS_URL=redis://...staging-redis...
GHL_CLIENT_ID=staging_client_id
GHL_CLIENT_SECRET=staging_client_secret
LOG_LEVEL=INFO
SENTRY_DSN=https://...@sentry.io/staging

# .env.production
ENVIRONMENT=production
DATABASE_URL=${DATABASE_URL_SECRET}  # From Secrets Manager
REDIS_URL=${REDIS_URL_SECRET}
GHL_CLIENT_ID=${GHL_CLIENT_ID_SECRET}
GHL_CLIENT_SECRET=${GHL_CLIENT_SECRET_SECRET}
LOG_LEVEL=WARNING
SENTRY_DSN=https://...@sentry.io/production
```

## 3.3 Infrastructure as Code (Terraform)

```hcl
# infrastructure/main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "flowmatch-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "flowmatch-terraform-locks"
    encrypt        = true
  }
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "flowmatch-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = var.environment != "production"
}

# RDS PostgreSQL
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "flowmatch-${var.environment}"

  engine               = "postgres"
  engine_version       = "15.4"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "flowmatch"
  username = "flowmatch_admin"
  port     = 5432

  multi_az               = var.environment == "production"
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [module.security_group_rds.security_group_id]

  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  deletion_protection = var.environment == "production"

  performance_insights_enabled = true
}

# ElastiCache Redis
module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"

  cluster_id           = "flowmatch-${var.environment}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.environment == "production" ? "cache.r6g.large" : "cache.t4g.medium"
  num_cache_clusters   = var.environment == "production" ? 2 : 1

  subnet_group_name    = module.vpc.elasticache_subnet_group_name
  security_group_ids   = [module.security_group_redis.security_group_id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

# ECS Cluster
module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "5.0.0"

  cluster_name = "flowmatch-${var.environment}"

  cluster_configuration = {
    execute_command_configuration = {
      logging = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = "/aws/ecs/flowmatch-${var.environment}"
      }
    }
  }

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

# ECS Services
resource "aws_ecs_service" "api" {
  name            = "flowmatch-api"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.environment == "production" ? 3 : 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [module.security_group_ecs.security_group_id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
}

resource "aws_ecs_service" "worker" {
  name            = "flowmatch-worker"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = var.environment == "production" ? 2 : 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [module.security_group_ecs.security_group_id]
  }
}

# S3 for frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "flowmatch-frontend-${var.environment}"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA routing
  }
}

# CloudFront
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-frontend"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = var.environment == "production" ? ["mergematch.app", "www.mergematch.app"] : ["staging.mergematch.app"]

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # SPA routing - serve index.html for 404s
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
```

## 3.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: flowmatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          docker-compose -f docker-compose.test.yml up -d
          docker-compose -f docker-compose.test.yml run --rm test pytest
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.build.outputs.image_tag }}
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker images
        id: build
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Build API image
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:api-$IMAGE_TAG -f backend/Dockerfile backend/
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:api-$IMAGE_TAG

          # Build Worker image
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:worker-$IMAGE_TAG -f backend/Dockerfile.worker backend/
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:worker-$IMAGE_TAG

          echo "image_tag=$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Upload frontend to S3
        run: |
          aws s3 sync frontend/dist s3://flowmatch-frontend-${{ github.event.inputs.environment || 'staging' }} --delete

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS
        run: |
          # Update API service
          aws ecs update-service \
            --cluster flowmatch-staging \
            --service flowmatch-api \
            --force-new-deployment

          # Update Worker service
          aws ecs update-service \
            --cluster flowmatch-staging \
            --service flowmatch-worker \
            --force-new-deployment

          # Wait for deployment
          aws ecs wait services-stable \
            --cluster flowmatch-staging \
            --services flowmatch-api flowmatch-worker

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_STAGING_ID }} \
            --paths "/*"

      - name: Run smoke tests
        run: |
          curl -f https://staging.mergematch.app/health || exit 1
          curl -f https://staging-api.mergematch.app/health || exit 1

  deploy-production:
    needs: [build, deploy-staging]
    if: github.event.inputs.environment == 'production'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS (Blue/Green)
        run: |
          # Uses CodeDeploy for blue/green deployment
          aws deploy create-deployment \
            --application-name flowmatch-production \
            --deployment-group-name flowmatch-api \
            --revision '{"revisionType":"AppSpecContent","appSpecContent":{"content":"{...}"}}'

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster flowmatch-production \
            --services flowmatch-api flowmatch-worker

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_PRODUCTION_ID }} \
            --paths "/*"
```

## 3.5 Backup & Recovery

### Backup Schedule
| Resource | Frequency | Retention | RPO | RTO |
|----------|-----------|-----------|-----|-----|
| RDS (automated) | Daily | 30 days | 24h | 1h |
| RDS (manual snapshots) | Weekly | 90 days | 7d | 2h |
| Redis (snapshot) | Every 6h | 7 days | 6h | 30m |
| S3 (versioning) | Continuous | 30 days | 0 | 15m |
| Audit logs | Continuous | 1 year | 0 | N/A |

### Disaster Recovery Procedure
```markdown
## RDS Recovery

1. **Point-in-Time Recovery** (for data corruption):
   ```bash
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier flowmatch-production \
     --target-db-instance-identifier flowmatch-recovery \
     --restore-time 2024-12-18T10:00:00Z
   ```

2. **Snapshot Recovery** (for complete failure):
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier flowmatch-production-new \
     --db-snapshot-identifier flowmatch-manual-weekly-20241215
   ```

3. **Update connection strings** in Secrets Manager

4. **Verify data integrity**:
   ```sql
   SELECT COUNT(*) FROM tenants;
   SELECT COUNT(*) FROM match_pairs WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

## Complete Environment Recovery

1. Run Terraform to recreate infrastructure:
   ```bash
   cd infrastructure
   terraform init
   terraform plan -var-file=production.tfvars
   terraform apply -var-file=production.tfvars
   ```

2. Restore RDS from latest snapshot

3. Restore Redis from snapshot (or accept cold cache)

4. Deploy latest application version

5. Run health checks and smoke tests

6. Update DNS if needed
```

---

# 4. SECURITY SPECIFICATION

## 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   USER                    FLOWMATCH                         GHL             │
│    │                         │                               │              │
│    │  1. Click Install       │                               │              │
│    │ ────────────────────────>                               │              │
│    │                         │                               │              │
│    │  2. Redirect to GHL OAuth                               │              │
│    │ <────────────────────────────────────────────────────────>             │
│    │                         │                               │              │
│    │  3. User authorizes     │                               │              │
│    │ ─────────────────────────────────────────────────────────>             │
│    │                         │                               │              │
│    │                         │  4. OAuth callback with code  │              │
│    │                         │ <─────────────────────────────               │
│    │                         │                               │              │
│    │                         │  5. Exchange code for tokens  │              │
│    │                         │ ─────────────────────────────>│              │
│    │                         │                               │              │
│    │                         │  6. Access + Refresh tokens   │              │
│    │                         │ <─────────────────────────────│              │
│    │                         │                               │              │
│    │                         │  7. Encrypt & store tokens    │              │
│    │                         │  8. Create MergeMatch session  │              │
│    │                         │                               │              │
│    │  9. Redirect to app     │                               │              │
│    │     with session cookie │                               │              │
│    │ <────────────────────────                               │              │
│    │                         │                               │              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Token Management

```python
# app/core/security/tokens.py

from cryptography.fernet import Fernet
from datetime import datetime, timedelta
import boto3

class TokenManager:
    """Manages GHL OAuth tokens with encryption and auto-refresh"""

    def __init__(self):
        # Load encryption key from AWS KMS
        self.kms_client = boto3.client('kms')
        self.encryption_key = self._get_encryption_key()
        self.fernet = Fernet(self.encryption_key)

    def _get_encryption_key(self) -> bytes:
        """Retrieve data key from KMS"""
        response = self.kms_client.generate_data_key(
            KeyId='alias/flowmatch-tokens',
            KeySpec='AES_256'
        )
        return response['Plaintext']

    def encrypt_token(self, token: str) -> str:
        """Encrypt token for storage"""
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt token for use"""
        return self.fernet.decrypt(encrypted_token.encode()).decode()

    async def get_valid_access_token(self, tenant_id: str, location_id: str) -> str:
        """Get valid access token, refreshing if needed"""

        token_record = await self.token_repo.get(tenant_id, location_id)

        # Check if token expires within 24 hours
        if token_record.expires_at < datetime.utcnow() + timedelta(hours=24):
            token_record = await self._refresh_token(token_record)

        return self.decrypt_token(token_record.access_token_encrypted)

    async def _refresh_token(self, token_record) -> TokenRecord:
        """Refresh OAuth token with GHL"""

        refresh_token = self.decrypt_token(token_record.refresh_token_encrypted)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://services.leadconnectorhq.com/oauth/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": settings.GHL_CLIENT_ID,
                    "client_secret": settings.GHL_CLIENT_SECRET,
                }
            )
            response.raise_for_status()
            data = response.json()

        # Update stored tokens
        token_record.access_token_encrypted = self.encrypt_token(data["access_token"])
        token_record.refresh_token_encrypted = self.encrypt_token(data["refresh_token"])
        token_record.expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

        await self.token_repo.save(token_record)

        return token_record
```

## 4.3 Authorization Model

```python
# app/core/security/permissions.py

from enum import Enum
from typing import List

class Permission(str, Enum):
    # Match operations
    MATCHES_READ = "matches:read"
    MATCHES_APPROVE = "matches:approve"
    MATCHES_REJECT = "matches:reject"

    # Merge operations
    MERGES_READ = "merges:read"
    MERGES_EXECUTE = "merges:execute"
    MERGES_ROLLBACK = "merges:rollback"

    # Rule management
    RULES_READ = "rules:read"
    RULES_WRITE = "rules:write"
    RULES_DELETE = "rules:delete"

    # Job management
    JOBS_READ = "jobs:read"
    JOBS_WRITE = "jobs:write"
    JOBS_EXECUTE = "jobs:execute"

    # Settings
    SETTINGS_READ = "settings:read"
    SETTINGS_WRITE = "settings:write"

    # Admin
    ADMIN_ALL = "admin:*"

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    READONLY = "readonly"

ROLE_PERMISSIONS: dict[Role, List[Permission]] = {
    Role.ADMIN: [Permission.ADMIN_ALL],  # All permissions
    Role.USER: [
        Permission.MATCHES_READ,
        Permission.MATCHES_APPROVE,
        Permission.MATCHES_REJECT,
        Permission.MERGES_READ,
        Permission.MERGES_EXECUTE,
        Permission.RULES_READ,
        Permission.JOBS_READ,
        Permission.SETTINGS_READ,
    ],
    Role.READONLY: [
        Permission.MATCHES_READ,
        Permission.MERGES_READ,
        Permission.RULES_READ,
        Permission.JOBS_READ,
    ],
}

def has_permission(user_role: Role, required_permission: Permission) -> bool:
    """Check if role has required permission"""
    user_permissions = ROLE_PERMISSIONS.get(user_role, [])

    if Permission.ADMIN_ALL in user_permissions:
        return True

    return required_permission in user_permissions

# FastAPI dependency
async def require_permission(permission: Permission):
    """Dependency to check permission"""
    async def checker(current_user: User = Depends(get_current_user)):
        if not has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=403,
                detail={"code": "FM-1004", "message": "Insufficient permissions"}
            )
        return current_user
    return checker
```

## 4.4 Row-Level Security Implementation

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE match_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedup_jobs ENABLE ROW LEVEL SECURITY;

-- Create function to get current tenant from session
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for each table
CREATE POLICY tenant_isolation ON match_pairs
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON merges
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON match_rules
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON dedup_jobs
    FOR ALL
    USING (tenant_id = current_tenant_id());

-- Application sets tenant context on each request
-- SET LOCAL app.current_tenant_id = 'uuid-here';
```

```python
# app/db/session.py

from contextlib import asynccontextmanager

@asynccontextmanager
async def tenant_session(tenant_id: str):
    """Create database session with tenant context"""
    async with async_session() as session:
        # Set tenant context for RLS
        await session.execute(
            text(f"SET LOCAL app.current_tenant_id = '{tenant_id}'")
        )
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

## 4.5 Input Validation & Sanitization

```python
# app/schemas/validation.py

from pydantic import BaseModel, validator, constr, EmailStr
import re
import bleach

class ContactInput(BaseModel):
    """Validated contact input"""

    email: EmailStr | None = None
    phone: constr(max_length=20) | None = None
    name: constr(max_length=255) | None = None
    company_name: constr(max_length=255) | None = None

    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        # Strip to digits and common separators
        cleaned = re.sub(r'[^\d+\-\(\)\s]', '', v)
        if len(cleaned) < 7 or len(cleaned) > 20:
            raise ValueError('Invalid phone number format')
        return cleaned

    @validator('name', 'company_name')
    def sanitize_text(cls, v):
        if v is None:
            return v
        # Remove potential XSS
        return bleach.clean(v, tags=[], strip=True)

class MatchRuleInput(BaseModel):
    """Validated match rule input"""

    name: constr(min_length=1, max_length=255)
    source_object: str
    match_fields: list[dict]

    @validator('source_object')
    def validate_object_type(cls, v):
        allowed = ['contact', 'company', 'opportunity', 'custom']
        if v not in allowed and not v.startswith('custom:'):
            raise ValueError(f'Invalid object type. Must be one of: {allowed}')
        return v

    @validator('match_fields')
    def validate_match_fields(cls, v):
        if not v:
            raise ValueError('At least one match field required')

        total_weight = sum(f.get('weight', 0) for f in v)
        if abs(total_weight - 1.0) > 0.01:
            raise ValueError('Match field weights must sum to 1.0')

        return v
```

## 4.6 Security Headers

```python
# app/middleware/security.py

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "  # For embedded app
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' https://services.leadconnectorhq.com; "
            "frame-ancestors https://*.gohighlevel.com https://*.leadconnectorhq.com;"
        )

        # HSTS
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response

app = FastAPI()
app.add_middleware(SecurityHeadersMiddleware)
```

## 4.7 Webhook Security

```python
# app/api/routes/webhooks.py

import hmac
import hashlib
from fastapi import Header, HTTPException

async def verify_ghl_webhook(
    request: Request,
    x_ghl_signature: str = Header(None)
):
    """Verify webhook signature from GHL"""

    if not x_ghl_signature:
        raise HTTPException(status_code=401, detail="Missing webhook signature")

    body = await request.body()

    # Calculate expected signature
    expected_signature = hmac.new(
        settings.GHL_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(x_ghl_signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

@router.post("/webhooks/ghl")
async def handle_ghl_webhook(
    payload: dict,
    _: None = Depends(verify_ghl_webhook)
):
    """Handle incoming GHL webhooks"""

    # Process webhook with idempotency
    webhook_id = payload.get("webhookId")
    if await webhook_repo.is_processed(webhook_id):
        return {"status": "already_processed"}

    # Process based on type
    event_type = payload.get("type")
    await process_webhook_event(event_type, payload)

    # Mark as processed
    await webhook_repo.mark_processed(webhook_id)

    return {"status": "processed"}
```

## 4.8 Secrets Management

```yaml
# AWS Secrets Manager structure

flowmatch/production/database:
  username: flowmatch_admin
  password: <generated>
  host: flowmatch-production.xxxxx.us-east-1.rds.amazonaws.com
  port: 5432
  database: flowmatch

flowmatch/production/ghl:
  client_id: <from GHL developer portal>
  client_secret: <from GHL developer portal>
  webhook_secret: <generated>

flowmatch/production/encryption:
  kms_key_id: alias/flowmatch-tokens

flowmatch/production/redis:
  host: flowmatch-production.xxxxx.cache.amazonaws.com
  port: 6379
  auth_token: <generated>
```

```python
# app/config.py

import boto3
import json
from functools import lru_cache

@lru_cache()
def get_secret(secret_name: str) -> dict:
    """Retrieve secret from AWS Secrets Manager"""
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

class Settings:
    def __init__(self):
        env = os.getenv('ENVIRONMENT', 'development')

        if env in ('staging', 'production'):
            db_secret = get_secret(f'flowmatch/{env}/database')
            ghl_secret = get_secret(f'flowmatch/{env}/ghl')

            self.DATABASE_URL = (
                f"postgresql://{db_secret['username']}:{db_secret['password']}"
                f"@{db_secret['host']}:{db_secret['port']}/{db_secret['database']}"
            )
            self.GHL_CLIENT_ID = ghl_secret['client_id']
            self.GHL_CLIENT_SECRET = ghl_secret['client_secret']
        else:
            # Local development uses .env
            self.DATABASE_URL = os.getenv('DATABASE_URL')
            self.GHL_CLIENT_ID = os.getenv('GHL_CLIENT_ID')
            self.GHL_CLIENT_SECRET = os.getenv('GHL_CLIENT_SECRET')
```

## 4.9 STRIDE Threat Model

MergeMatch handles sensitive CRM data. This threat model identifies key attack vectors.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        STRIDE THREAT MODEL: FLOWMATCH                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SPOOFING (Identity)                                                            │
│  ├── Threat: Attacker impersonates legitimate GHL user                         │
│  ├── Attack Vector: Stolen OAuth tokens, session hijacking                     │
│  ├── Mitigation: Short-lived tokens (24h), secure HttpOnly cookies,            │
│  │               token binding to IP/user-agent fingerprint                    │
│  └── Residual Risk: LOW (with mitigations)                                     │
│                                                                                 │
│  TAMPERING (Data Integrity)                                                     │
│  ├── Threat: Attacker modifies merge rules or match decisions                  │
│  ├── Attack Vector: API manipulation, CSRF attacks                             │
│  ├── Mitigation: CSRF tokens, audit logging, input validation,                 │
│  │               immutable merge history                                        │
│  └── Residual Risk: LOW                                                         │
│                                                                                 │
│  REPUDIATION (Non-denial)                                                       │
│  ├── Threat: User denies performing merge/delete action                        │
│  ├── Attack Vector: Shared credentials, missing audit trail                    │
│  ├── Mitigation: Comprehensive audit log with user_id, timestamp,              │
│  │               action details; 90-day retention                               │
│  └── Residual Risk: LOW                                                         │
│                                                                                 │
│  INFORMATION DISCLOSURE                                                         │
│  ├── Threat: Unauthorized access to contacts/PII                               │
│  ├── Attack Vector: IDOR, SQL injection, log exposure                          │
│  ├── Mitigation: Row-Level Security, parameterized queries,                    │
│  │               PII redaction in logs, encryption at rest                      │
│  └── Residual Risk: MEDIUM (PII sensitivity)                                   │
│                                                                                 │
│  DENIAL OF SERVICE                                                              │
│  ├── Threat: Service unavailable during critical operations                    │
│  ├── Attack Vector: Resource exhaustion, large scan jobs                       │
│  ├── Mitigation: Rate limiting, job queue limits, circuit breakers,            │
│  │               auto-scaling                                                   │
│  └── Residual Risk: LOW                                                         │
│                                                                                 │
│  ELEVATION OF PRIVILEGE                                                         │
│  ├── Threat: User accesses other tenant's data or admin functions              │
│  ├── Attack Vector: Broken access control, tenant ID manipulation              │
│  ├── Mitigation: RLS at database level, tenant context validation              │
│  │               on every request, RBAC checks in middleware                    │
│  └── Residual Risk: LOW (with RLS)                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### High-Risk Data Flows

```mermaid
flowchart LR
    subgraph External
        GHL[GHL API]
        User[User Browser]
    end

    subgraph MergeMatch
        API[API Gateway]
        Auth[Auth Service]
        Match[Matching Engine]
        DB[(PostgreSQL)]
    end

    User -->|1. OAuth Token| API
    API -->|2. Validate| Auth
    Auth -->|3. Set Tenant Context| DB
    API -->|4. Fetch Contacts| GHL
    GHL -->|5. PII Data| Match
    Match -->|6. Store Matches| DB

    style GHL fill:#ff9999
    style DB fill:#99ff99
```

**Trust Boundaries:**
1. User → API: Untrusted input, must validate all
2. API → GHL: Third-party dependency, handle failures
3. Match → DB: Internal, but enforce RLS

## 4.10 OWASP Top 10 Mapping

| OWASP 2021 | Risk Level | MergeMatch Mitigation | Status |
|------------|------------|---------------------|--------|
| **A01: Broken Access Control** | HIGH | RLS, RBAC, tenant isolation tests | ✅ Implemented |
| **A02: Cryptographic Failures** | MEDIUM | AES-256 token encryption, TLS 1.2+, KMS | ✅ Implemented |
| **A03: Injection** | HIGH | SQLAlchemy ORM, Pydantic validation, bleach sanitization | ✅ Implemented |
| **A04: Insecure Design** | MEDIUM | Threat model (this doc), security reviews | ✅ Documented |
| **A05: Security Misconfiguration** | MEDIUM | Terraform IaC, security headers, CSP | ✅ Implemented |
| **A06: Vulnerable Components** | MEDIUM | Dependabot, pip-audit, npm audit | 🔲 CI pipeline |
| **A07: Auth Failures** | HIGH | OAuth 2.0, short-lived tokens, secure cookies | ✅ Implemented |
| **A08: Software/Data Integrity** | LOW | Signed webhooks, CI/CD integrity checks | ✅ Implemented |
| **A09: Logging Failures** | MEDIUM | Structured logging, PII redaction, audit trail | ✅ Implemented |
| **A10: SSRF** | LOW | No user-controlled URLs, allowlisted GHL endpoints | ✅ Mitigated |

### Injection Prevention Details

```python
# SAFE: Using SQLAlchemy ORM (parameterized queries)
async def get_matches_by_location(location_id: str) -> list[MatchPair]:
    # location_id is validated UUID by Pydantic before reaching here
    return await session.execute(
        select(MatchPair).where(MatchPair.location_id == location_id)
    )

# NEVER DO THIS:
# query = f"SELECT * FROM match_pairs WHERE location_id = '{location_id}'"  # SQL INJECTION!

# SAFE: Bleach for any user-provided text stored/displayed
from bleach import clean
sanitized_name = clean(user_input, tags=[], strip=True)
```

### Vulnerable Component Scanning

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Python dependencies
      - name: Run pip-audit
        run: |
          pip install pip-audit
          pip-audit --require-hashes -r requirements.txt

      # JavaScript dependencies
      - name: Run npm audit
        run: npm audit --audit-level=high
        working-directory: ./frontend

      # Container scanning
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'flowmatch/api:${{ github.sha }}'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

## 4.11 Security Testing Checklist

### Pre-Release Security Gate

```markdown
## Security Review Checklist

### Authentication & Authorization
- [ ] OAuth flow tested with expired tokens
- [ ] Session timeout works correctly (24h)
- [ ] RBAC permissions enforced on all endpoints
- [ ] Tenant isolation verified (cannot access other tenant data)
- [ ] API keys rotated in staging before production

### Input Validation
- [ ] All endpoints reject malformed JSON
- [ ] SQL injection payloads rejected (sqlmap scan)
- [ ] XSS payloads sanitized in all text fields
- [ ] File upload disabled or restricted (if applicable)
- [ ] Rate limiting triggers correctly

### Data Protection
- [ ] PII not logged (grep logs for email/phone patterns)
- [ ] Tokens encrypted at rest
- [ ] TLS 1.2+ enforced (no fallback)
- [ ] Secure headers present (check with securityheaders.com)

### Infrastructure
- [ ] No secrets in code (trufflehog scan)
- [ ] Dependabot alerts resolved
- [ ] Container scan passed (Trivy)
- [ ] WAF rules active in production
```

### SAST/DAST Integration

```python
# tests/security/test_sast.py
"""
Static Application Security Testing
Run with: pytest tests/security/ -v
"""

import subprocess
import pytest

class TestStaticSecurity:
    def test_bandit_scan(self):
        """Run Bandit for Python security issues"""
        result = subprocess.run(
            ["bandit", "-r", "app/", "-f", "json", "-ll"],
            capture_output=True
        )
        assert result.returncode == 0, f"Bandit found issues: {result.stdout.decode()}"

    def test_semgrep_scan(self):
        """Run Semgrep for security patterns"""
        result = subprocess.run(
            ["semgrep", "--config=p/security-audit", "app/", "--json"],
            capture_output=True
        )
        assert result.returncode == 0, f"Semgrep found issues: {result.stdout.decode()}"

    def test_no_hardcoded_secrets(self):
        """Check for hardcoded secrets"""
        result = subprocess.run(
            ["trufflehog", "filesystem", ".", "--json", "--only-verified"],
            capture_output=True
        )
        output = result.stdout.decode()
        assert "secret" not in output.lower(), "Hardcoded secrets detected!"

class TestDynamicSecurity:
    @pytest.fixture
    def base_url(self):
        return "http://localhost:8000"

    def test_security_headers(self, base_url):
        """Verify security headers present"""
        import requests
        response = requests.get(f"{base_url}/health")

        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert "Content-Security-Policy" in response.headers
        assert response.headers.get("Strict-Transport-Security") is not None

    def test_cors_restrictions(self, base_url):
        """Verify CORS doesn't allow wildcard"""
        import requests
        response = requests.options(
            f"{base_url}/v1/matches",
            headers={"Origin": "https://evil.com"}
        )
        assert response.headers.get("Access-Control-Allow-Origin") != "*"

    def test_sql_injection_blocked(self, base_url, auth_headers):
        """Basic SQLi payloads should be rejected"""
        import requests
        payloads = [
            "' OR '1'='1",
            "1; DROP TABLE users;--",
            "1 UNION SELECT * FROM users--"
        ]
        for payload in payloads:
            response = requests.get(
                f"{base_url}/v1/matches",
                params={"location_id": payload},
                headers=auth_headers
            )
            # Should get 422 (validation error) not 500 (server error)
            assert response.status_code in [400, 422], f"SQLi payload accepted: {payload}"
```

### Penetration Testing Schedule

| Test Type | Frequency | Scope | Provider |
|-----------|-----------|-------|----------|
| Automated DAST | Every deploy | Full API | OWASP ZAP (CI) |
| Dependency scan | Weekly | All deps | Dependabot + pip-audit |
| Manual pentest | Annually | Full app | External vendor |
| Bug bounty | Ongoing | Production | HackerOne (future) |

---

# 5. ERROR HANDLING & EDGE CASES

## 5.1 Error Code Catalog

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLOWMATCH ERROR CODES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FM-1XXX: AUTHENTICATION & AUTHORIZATION                                    │
│  ├── FM-1001: Token expired                                                 │
│  ├── FM-1002: Invalid token                                                 │
│  ├── FM-1003: Missing authorization header                                  │
│  ├── FM-1004: Insufficient permissions                                      │
│  ├── FM-1005: Token refresh failed                                          │
│  ├── FM-1006: Session expired                                               │
│  ├── FM-1007: Invalid OAuth state                                           │
│  └── FM-1008: GHL authorization revoked                                     │
│                                                                             │
│  FM-2XXX: VALIDATION ERRORS                                                 │
│  ├── FM-2001: Invalid request body                                          │
│  ├── FM-2002: Missing required field                                        │
│  ├── FM-2003: Field validation failed                                       │
│  ├── FM-2004: Invalid object type                                           │
│  ├── FM-2005: Invalid match rule configuration                              │
│  ├── FM-2006: Weights do not sum to 1.0                                     │
│  ├── FM-2007: Invalid confidence threshold                                  │
│  ├── FM-2008: Invalid cron expression                                       │
│  ├── FM-2009: Invalid date range                                            │
│  └── FM-2010: Payload too large                                             │
│                                                                             │
│  FM-3XXX: GHL API ERRORS                                                    │
│  ├── FM-3001: GHL API rate limited                                          │
│  ├── FM-3002: GHL API timeout                                               │
│  ├── FM-3003: GHL API unauthorized                                          │
│  ├── FM-3004: GHL record not found                                          │
│  ├── FM-3005: GHL API unexpected error                                      │
│  ├── FM-3006: GHL API unavailable                                           │
│  ├── FM-3007: GHL webhook delivery failed                                   │
│  └── FM-3008: GHL scope insufficient                                        │
│                                                                             │
│  FM-4XXX: MERGE ERRORS                                                      │
│  ├── FM-4001: Record no longer exists                                       │
│  ├── FM-4002: Concurrent merge in progress                                  │
│  ├── FM-4003: Merge validation failed                                       │
│  ├── FM-4004: Rollback expired                                              │
│  ├── FM-4005: Partial merge failure                                         │
│  ├── FM-4006: Match pair already resolved                                   │
│  ├── FM-4007: Master record deleted                                         │
│  ├── FM-4008: Associated records conflict                                   │
│  └── FM-4009: Rollback failed                                               │
│                                                                             │
│  FM-5XXX: JOB ERRORS                                                        │
│  ├── FM-5001: Job already running                                           │
│  ├── FM-5002: Job timeout exceeded                                          │
│  ├── FM-5003: Rate limit exhausted                                          │
│  ├── FM-5004: Job cancelled                                                 │
│  ├── FM-5005: Job not found                                                 │
│  ├── FM-5006: Job queue full                                                │
│  └── FM-5007: Worker unavailable                                            │
│                                                                             │
│  FM-6XXX: RESOURCE ERRORS                                                   │
│  ├── FM-6001: Resource not found                                            │
│  ├── FM-6002: Resource already exists                                       │
│  ├── FM-6003: Resource limit exceeded                                       │
│  └── FM-6004: Resource locked                                               │
│                                                                             │
│  FM-9XXX: SYSTEM ERRORS                                                     │
│  ├── FM-9001: Internal server error                                         │
│  ├── FM-9002: Database connection failed                                    │
│  ├── FM-9003: Cache connection failed                                       │
│  └── FM-9999: Unknown error                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Error Response Implementation

```python
# app/core/errors.py

from enum import Enum
from typing import Any, Optional
from fastapi import HTTPException
from pydantic import BaseModel
import uuid

class ErrorCode(str, Enum):
    # Authentication
    TOKEN_EXPIRED = "FM-1001"
    INVALID_TOKEN = "FM-1002"
    MISSING_AUTH = "FM-1003"
    INSUFFICIENT_PERMISSIONS = "FM-1004"
    TOKEN_REFRESH_FAILED = "FM-1005"

    # Validation
    INVALID_REQUEST_BODY = "FM-2001"
    MISSING_REQUIRED_FIELD = "FM-2002"
    FIELD_VALIDATION_FAILED = "FM-2003"
    INVALID_OBJECT_TYPE = "FM-2004"
    INVALID_RULE_CONFIG = "FM-2005"

    # GHL API
    GHL_RATE_LIMITED = "FM-3001"
    GHL_TIMEOUT = "FM-3002"
    GHL_UNAUTHORIZED = "FM-3003"
    GHL_RECORD_NOT_FOUND = "FM-3004"
    GHL_API_ERROR = "FM-3005"

    # Merge
    RECORD_NOT_EXISTS = "FM-4001"
    CONCURRENT_MERGE = "FM-4002"
    MERGE_VALIDATION_FAILED = "FM-4003"
    ROLLBACK_EXPIRED = "FM-4004"
    PARTIAL_MERGE_FAILURE = "FM-4005"

    # Jobs
    JOB_ALREADY_RUNNING = "FM-5001"
    JOB_TIMEOUT = "FM-5002"
    RATE_LIMIT_EXHAUSTED = "FM-5003"

    # System
    INTERNAL_ERROR = "FM-9001"
    DATABASE_ERROR = "FM-9002"

ERROR_MESSAGES = {
    ErrorCode.TOKEN_EXPIRED: "Your session has expired. Please log in again.",
    ErrorCode.INVALID_TOKEN: "Invalid authentication token.",
    ErrorCode.MISSING_AUTH: "Authentication required.",
    ErrorCode.INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",
    ErrorCode.TOKEN_REFRESH_FAILED: "Failed to refresh authentication. Please log in again.",

    ErrorCode.INVALID_REQUEST_BODY: "The request body is invalid.",
    ErrorCode.MISSING_REQUIRED_FIELD: "A required field is missing: {field}",
    ErrorCode.FIELD_VALIDATION_FAILED: "Field validation failed: {field} - {reason}",
    ErrorCode.INVALID_OBJECT_TYPE: "Invalid object type: {type}. Must be one of: contact, company, opportunity",
    ErrorCode.INVALID_RULE_CONFIG: "Match rule configuration is invalid: {reason}",

    ErrorCode.GHL_RATE_LIMITED: "GoHighLevel API rate limit reached. Please try again in {retry_after} seconds.",
    ErrorCode.GHL_TIMEOUT: "GoHighLevel API request timed out. Please try again.",
    ErrorCode.GHL_UNAUTHORIZED: "GoHighLevel authorization failed. Please reconnect your account.",
    ErrorCode.GHL_RECORD_NOT_FOUND: "Record not found in GoHighLevel: {record_id}",
    ErrorCode.GHL_API_ERROR: "GoHighLevel API error: {message}",

    ErrorCode.RECORD_NOT_EXISTS: "One or more records no longer exist in GoHighLevel.",
    ErrorCode.CONCURRENT_MERGE: "A merge is already in progress for these records.",
    ErrorCode.MERGE_VALIDATION_FAILED: "Merge validation failed: {reason}",
    ErrorCode.ROLLBACK_EXPIRED: "This merge can no longer be rolled back. The 30-day window has expired.",
    ErrorCode.PARTIAL_MERGE_FAILURE: "Merge partially completed. Some associated records could not be transferred.",

    ErrorCode.JOB_ALREADY_RUNNING: "This job is already running.",
    ErrorCode.JOB_TIMEOUT: "Job exceeded maximum execution time of {timeout} minutes.",
    ErrorCode.RATE_LIMIT_EXHAUSTED: "Daily API limit reached. Resuming tomorrow.",

    ErrorCode.INTERNAL_ERROR: "An unexpected error occurred. Please try again or contact support.",
    ErrorCode.DATABASE_ERROR: "Database connection error. Please try again.",
}

HTTP_STATUS_CODES = {
    ErrorCode.TOKEN_EXPIRED: 401,
    ErrorCode.INVALID_TOKEN: 401,
    ErrorCode.MISSING_AUTH: 401,
    ErrorCode.INSUFFICIENT_PERMISSIONS: 403,
    ErrorCode.TOKEN_REFRESH_FAILED: 401,

    ErrorCode.INVALID_REQUEST_BODY: 400,
    ErrorCode.MISSING_REQUIRED_FIELD: 400,
    ErrorCode.FIELD_VALIDATION_FAILED: 400,
    ErrorCode.INVALID_OBJECT_TYPE: 400,
    ErrorCode.INVALID_RULE_CONFIG: 400,

    ErrorCode.GHL_RATE_LIMITED: 429,
    ErrorCode.GHL_TIMEOUT: 504,
    ErrorCode.GHL_UNAUTHORIZED: 401,
    ErrorCode.GHL_RECORD_NOT_FOUND: 404,
    ErrorCode.GHL_API_ERROR: 502,

    ErrorCode.RECORD_NOT_EXISTS: 404,
    ErrorCode.CONCURRENT_MERGE: 409,
    ErrorCode.MERGE_VALIDATION_FAILED: 400,
    ErrorCode.ROLLBACK_EXPIRED: 400,
    ErrorCode.PARTIAL_MERGE_FAILURE: 500,

    ErrorCode.JOB_ALREADY_RUNNING: 409,
    ErrorCode.JOB_TIMEOUT: 504,
    ErrorCode.RATE_LIMIT_EXHAUSTED: 429,

    ErrorCode.INTERNAL_ERROR: 500,
    ErrorCode.DATABASE_ERROR: 503,
}

class MergeMatchError(Exception):
    """Base exception for MergeMatch errors"""

    def __init__(
        self,
        code: ErrorCode,
        details: Optional[dict[str, Any]] = None,
        request_id: Optional[str] = None
    ):
        self.code = code
        self.details = details or {}
        self.request_id = request_id or str(uuid.uuid4())
        self.message = ERROR_MESSAGES[code].format(**self.details)
        self.status_code = HTTP_STATUS_CODES[code]
        super().__init__(self.message)

    def to_response(self) -> dict:
        return {
            "error": {
                "code": self.code.value,
                "message": self.message,
                "details": self.details if self.details else None,
                "request_id": self.request_id
            }
        }

# Exception handler for FastAPI
@app.exception_handler(MergeMatchError)
async def flowmatch_error_handler(request: Request, exc: MergeMatchError):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_response()
    )

# Usage examples
raise MergeMatchError(
    ErrorCode.GHL_RATE_LIMITED,
    details={"retry_after": 30}
)

raise MergeMatchError(
    ErrorCode.MISSING_REQUIRED_FIELD,
    details={"field": "email"}
)
```

## 5.3 Retry Policies

```python
# app/core/retry.py

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
import httpx
import logging

logger = logging.getLogger(__name__)

# GHL API retry policy
ghl_api_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True
)

# Database retry policy
db_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=0.1, min=0.1, max=1),
    retry=retry_if_exception_type((ConnectionError, TimeoutError)),
    reraise=True
)

# Celery task retry policy
class CeleryRetryPolicy:
    """Retry policy for Celery tasks"""

    # Default: 3 retries with exponential backoff
    DEFAULT = {
        "max_retries": 3,
        "default_retry_delay": 60,  # 1 minute
        "retry_backoff": True,
        "retry_backoff_max": 600,  # 10 minutes max
        "retry_jitter": True,
    }

    # For GHL API calls: more retries, longer delays
    GHL_API = {
        "max_retries": 5,
        "default_retry_delay": 30,
        "retry_backoff": True,
        "retry_backoff_max": 300,
        "retry_jitter": True,
    }

    # For merge operations: fewer retries, fail fast
    MERGE = {
        "max_retries": 2,
        "default_retry_delay": 10,
        "retry_backoff": False,
    }

# Usage in Celery tasks
@celery_app.task(
    bind=True,
    **CeleryRetryPolicy.GHL_API,
    autoretry_for=(GHLRateLimitError, GHLTimeoutError),
)
def fetch_contacts_task(self, location_id: str):
    try:
        return ghl_client.get_contacts(location_id)
    except GHLRateLimitError as e:
        # Use retry-after header if available
        raise self.retry(countdown=e.retry_after)
```

## 5.4 Circuit Breaker Pattern

```python
# app/core/circuit_breaker.py

from pybreaker import CircuitBreaker, CircuitBreakerError
import structlog

logger = structlog.get_logger()

# Circuit breaker for GHL API
ghl_circuit_breaker = CircuitBreaker(
    fail_max=5,              # Open after 5 failures
    reset_timeout=60,        # Try again after 60 seconds
    exclude=[                # Don't count these as failures
        GHLRecordNotFoundError,
        GHLValidationError,
    ],
    listeners=[
        # Log state changes
        lambda cb, old, new: logger.warning(
            "GHL circuit breaker state change",
            old_state=old,
            new_state=new
        )
    ]
)

# Circuit breaker for database
db_circuit_breaker = CircuitBreaker(
    fail_max=3,
    reset_timeout=30,
)

# Usage
@ghl_circuit_breaker
async def call_ghl_api(endpoint: str, **kwargs):
    """Call GHL API with circuit breaker protection"""
    async with httpx.AsyncClient() as client:
        response = await client.request(endpoint, **kwargs)
        response.raise_for_status()
        return response.json()

# Handle circuit open state
try:
    result = await call_ghl_api("/contacts", method="GET")
except CircuitBreakerError:
    # Circuit is open - GHL API is having issues
    raise MergeMatchError(
        ErrorCode.GHL_API_ERROR,
        details={"message": "GoHighLevel API is temporarily unavailable"}
    )
```

## 5.5 Idempotency

```python
# app/core/idempotency.py

from typing import Optional, Any
import hashlib
import json
from datetime import timedelta

class IdempotencyManager:
    """Manage idempotent operations"""

    def __init__(self, redis_client):
        self.redis = redis_client
        self.ttl = timedelta(hours=24)

    def _make_key(self, idempotency_key: str, operation: str) -> str:
        return f"idempotency:{operation}:{idempotency_key}"

    async def check_and_set(
        self,
        idempotency_key: str,
        operation: str,
        request_hash: str
    ) -> Optional[dict]:
        """
        Check if operation was already performed.
        Returns cached result if exists, None if new operation.
        """
        key = self._make_key(idempotency_key, operation)

        # Try to get existing result
        existing = await self.redis.get(key)
        if existing:
            cached = json.loads(existing)

            # Verify request matches
            if cached["request_hash"] != request_hash:
                raise MergeMatchError(
                    ErrorCode.INVALID_REQUEST_BODY,
                    details={"reason": "Idempotency key reused with different request"}
                )

            return cached["result"]

        # Set placeholder to prevent concurrent execution
        placeholder = json.dumps({
            "request_hash": request_hash,
            "status": "processing",
            "result": None
        })
        await self.redis.set(key, placeholder, ex=self.ttl)

        return None

    async def store_result(
        self,
        idempotency_key: str,
        operation: str,
        request_hash: str,
        result: dict
    ):
        """Store result of completed operation"""
        key = self._make_key(idempotency_key, operation)

        data = json.dumps({
            "request_hash": request_hash,
            "status": "completed",
            "result": result
        })
        await self.redis.set(key, data, ex=self.ttl)

# Usage in merge endpoint
@router.post("/merges")
async def create_merge(
    request: MergeRequest,
    idempotency: IdempotencyManager = Depends()
):
    # Generate request hash
    request_hash = hashlib.sha256(
        json.dumps(request.dict(), sort_keys=True).encode()
    ).hexdigest()

    # Check for existing result
    if request.idempotency_key:
        existing = await idempotency.check_and_set(
            request.idempotency_key,
            "merge",
            request_hash
        )
        if existing:
            return existing

    # Execute merge
    result = await merge_service.execute(request)

    # Store result
    if request.idempotency_key:
        await idempotency.store_result(
            request.idempotency_key,
            "merge",
            request_hash,
            result.dict()
        )

    return result
```

## 5.6 Dead Letter Queue

```python
# app/tasks/dlq.py

from celery import Task
import structlog

logger = structlog.get_logger()

class TaskWithDLQ(Task):
    """Base task class with dead letter queue support"""

    # After max retries, send to DLQ
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(
            "Task failed permanently, sending to DLQ",
            task_id=task_id,
            task_name=self.name,
            exception=str(exc),
            args=args,
            kwargs=kwargs
        )

        # Send to SQS Dead Letter Queue
        sqs_client.send_message(
            QueueUrl=settings.DLQ_URL,
            MessageBody=json.dumps({
                "task_id": task_id,
                "task_name": self.name,
                "args": args,
                "kwargs": kwargs,
                "exception": str(exc),
                "traceback": einfo.traceback,
                "timestamp": datetime.utcnow().isoformat()
            })
        )

        # Also store in database for visibility
        DLQEntry.create(
            task_id=task_id,
            task_name=self.name,
            payload={"args": args, "kwargs": kwargs},
            error=str(exc),
            traceback=einfo.traceback
        )

# Usage
@celery_app.task(base=TaskWithDLQ, max_retries=3)
def process_match_task(match_id: str):
    # Task implementation
    pass

# DLQ processor for manual review/replay
@celery_app.task
def process_dlq_entry(entry_id: str, action: str):
    """Process a DLQ entry: retry, skip, or archive"""
    entry = DLQEntry.get(entry_id)

    if action == "retry":
        # Re-queue the original task
        task = celery_app.tasks[entry.task_name]
        task.apply_async(
            args=entry.payload["args"],
            kwargs=entry.payload["kwargs"]
        )
        entry.status = "retried"

    elif action == "skip":
        entry.status = "skipped"

    elif action == "archive":
        entry.status = "archived"

    entry.save()
```

---

# 6. MONITORING & OBSERVABILITY

## 6.1 Logging Specification

```python
# app/core/logging.py

import structlog
from typing import Any

def configure_logging():
    """Configure structured logging"""

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Log format example:
{
    "timestamp": "2024-12-19T10:30:45.123456Z",
    "level": "info",
    "event": "merge_completed",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_id": "loc_abc123",
    "merge_id": "merge_xyz789",
    "master_record_id": "contact_111",
    "merged_count": 1,
    "duration_ms": 1234,
    "user_id": "user_456"
}

# Middleware to inject context
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())

    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        path=request.url.path,
        method=request.method,
    )

    # Add tenant context if authenticated
    if hasattr(request.state, "tenant_id"):
        structlog.contextvars.bind_contextvars(
            tenant_id=request.state.tenant_id,
            location_id=request.state.location_id
        )

    start_time = time.time()

    try:
        response = await call_next(request)

        logger.info(
            "request_completed",
            status_code=response.status_code,
            duration_ms=int((time.time() - start_time) * 1000)
        )

        response.headers["X-Request-ID"] = request_id
        return response

    except Exception as e:
        logger.exception("request_failed", exception=str(e))
        raise
```

## 6.2 Metrics Definition

```python
# app/core/metrics.py

from prometheus_client import Counter, Histogram, Gauge, Info
import time

# ========================================
# BUSINESS METRICS
# ========================================

matches_detected = Counter(
    'flowmatch_matches_detected_total',
    'Total number of duplicate matches detected',
    ['location_id', 'object_type', 'confidence_level']  # high/medium/low
)

merges_executed = Counter(
    'flowmatch_merges_executed_total',
    'Total number of merges executed',
    ['location_id', 'object_type', 'trigger']  # auto/manual
)

merges_failed = Counter(
    'flowmatch_merges_failed_total',
    'Total number of failed merges',
    ['location_id', 'error_code']
)

rollbacks_executed = Counter(
    'flowmatch_rollbacks_total',
    'Total number of merge rollbacks',
    ['location_id']
)

records_scanned = Counter(
    'flowmatch_records_scanned_total',
    'Total number of records scanned for duplicates',
    ['location_id', 'object_type']
)

pending_reviews = Gauge(
    'flowmatch_pending_reviews',
    'Current number of matches pending review',
    ['location_id']
)

# ========================================
# SYSTEM METRICS
# ========================================

api_request_duration = Histogram(
    'flowmatch_api_request_duration_seconds',
    'API request duration in seconds',
    ['endpoint', 'method', 'status_code'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

api_requests = Counter(
    'flowmatch_api_requests_total',
    'Total API requests',
    ['endpoint', 'method', 'status_code']
)

ghl_api_calls = Counter(
    'flowmatch_ghl_api_calls_total',
    'Total GHL API calls',
    ['endpoint', 'status']  # success/error/rate_limited
)

ghl_api_duration = Histogram(
    'flowmatch_ghl_api_duration_seconds',
    'GHL API call duration',
    ['endpoint'],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]
)

celery_task_duration = Histogram(
    'flowmatch_celery_task_duration_seconds',
    'Celery task duration',
    ['task_name', 'status'],  # success/failure
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 300.0, 600.0]
)

celery_queue_length = Gauge(
    'flowmatch_celery_queue_length',
    'Current Celery queue length',
    ['queue_name']
)

db_connection_pool = Gauge(
    'flowmatch_db_pool_size',
    'Database connection pool size',
    ['state']  # active/idle/overflow
)

token_refresh_failures = Counter(
    'flowmatch_token_refresh_failures_total',
    'OAuth token refresh failures',
    ['tenant_id', 'reason']
)

webhook_processing_duration = Histogram(
    'flowmatch_webhook_processing_seconds',
    'Webhook processing duration',
    ['event_type'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)

# ========================================
# MIDDLEWARE FOR AUTOMATIC COLLECTION
# ========================================

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time
    endpoint = request.url.path
    method = request.method
    status = str(response.status_code)

    api_request_duration.labels(
        endpoint=endpoint,
        method=method,
        status_code=status
    ).observe(duration)

    api_requests.labels(
        endpoint=endpoint,
        method=method,
        status_code=status
    ).inc()

    return response
```

## 6.3 Alerting Rules

```yaml
# prometheus/alerts.yml

groups:
  - name: flowmatch_critical
    rules:
      # API Health
      - alert: HighAPIErrorRate
        expr: |
          sum(rate(flowmatch_api_requests_total{status_code=~"5.."}[5m]))
          /
          sum(rate(flowmatch_api_requests_total[5m]))
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High API error rate (> 5%)"
          description: "API error rate is {{ $value | humanizePercentage }}"

      # Merge Health
      - alert: HighMergeFailureRate
        expr: |
          sum(rate(flowmatch_merges_failed_total[10m]))
          /
          sum(rate(flowmatch_merges_executed_total[10m]))
          > 0.10
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "High merge failure rate (> 10%)"
          description: "Merge failure rate is {{ $value | humanizePercentage }}"

      # GHL API Health
      - alert: GHLAPIDown
        expr: |
          sum(rate(flowmatch_ghl_api_calls_total{status="error"}[5m]))
          /
          sum(rate(flowmatch_ghl_api_calls_total[5m]))
          > 0.50
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "GHL API experiencing high error rate"

  - name: flowmatch_warning
    rules:
      # Latency
      - alert: HighAPILatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(flowmatch_api_request_duration_seconds_bucket[5m])) by (le)
          ) > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API latency p95 > 1s"

      # Queue Depth
      - alert: CeleryQueueBacklog
        expr: flowmatch_celery_queue_length > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Celery queue backlog > 1000 tasks"

      # GHL Rate Limiting
      - alert: GHLRateLimitWarning
        expr: |
          sum(rate(flowmatch_ghl_api_calls_total{status="rate_limited"}[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Experiencing GHL rate limiting"

      # Token Refresh Issues
      - alert: TokenRefreshFailures
        expr: |
          sum(rate(flowmatch_token_refresh_failures_total[1h])) > 5
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Multiple token refresh failures"

  - name: flowmatch_info
    rules:
      - alert: DailyJobFailed
        expr: |
          increase(flowmatch_celery_task_duration_seconds_count{
            task_name="daily_scan",
            status="failure"
          }[24h]) > 0
        labels:
          severity: info
        annotations:
          summary: "Daily scan job failed"
```

## 6.4 Dashboard Specification

```json
// Grafana Dashboard JSON (key panels)
{
  "title": "MergeMatch Operations",
  "panels": [
    {
      "title": "Matches Detected (Last 24h)",
      "type": "stat",
      "targets": [{
        "expr": "sum(increase(flowmatch_matches_detected_total[24h]))"
      }]
    },
    {
      "title": "Merges Executed (Last 24h)",
      "type": "stat",
      "targets": [{
        "expr": "sum(increase(flowmatch_merges_executed_total[24h]))"
      }]
    },
    {
      "title": "Merge Success Rate",
      "type": "gauge",
      "targets": [{
        "expr": "1 - (sum(rate(flowmatch_merges_failed_total[1h])) / sum(rate(flowmatch_merges_executed_total[1h])))"
      }],
      "thresholds": [
        {"value": 0.95, "color": "red"},
        {"value": 0.99, "color": "yellow"},
        {"value": 1.0, "color": "green"}
      ]
    },
    {
      "title": "Pending Reviews by Location",
      "type": "table",
      "targets": [{
        "expr": "topk(10, flowmatch_pending_reviews)"
      }]
    },
    {
      "title": "API Latency (p50, p95, p99)",
      "type": "timeseries",
      "targets": [
        {"expr": "histogram_quantile(0.50, sum(rate(flowmatch_api_request_duration_seconds_bucket[5m])) by (le))", "legendFormat": "p50"},
        {"expr": "histogram_quantile(0.95, sum(rate(flowmatch_api_request_duration_seconds_bucket[5m])) by (le))", "legendFormat": "p95"},
        {"expr": "histogram_quantile(0.99, sum(rate(flowmatch_api_request_duration_seconds_bucket[5m])) by (le))", "legendFormat": "p99"}
      ]
    },
    {
      "title": "GHL API Calls by Status",
      "type": "timeseries",
      "targets": [{
        "expr": "sum(rate(flowmatch_ghl_api_calls_total[5m])) by (status)"
      }]
    },
    {
      "title": "Celery Queue Depth",
      "type": "timeseries",
      "targets": [{
        "expr": "flowmatch_celery_queue_length"
      }]
    },
    {
      "title": "Confidence Distribution",
      "type": "piechart",
      "targets": [{
        "expr": "sum(increase(flowmatch_matches_detected_total[24h])) by (confidence_level)"
      }]
    }
  ]
}
```

## 6.5 Distributed Tracing

```python
# app/core/tracing.py

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.celery import CeleryInstrumentor

def configure_tracing(app: FastAPI):
    """Configure OpenTelemetry distributed tracing"""

    # Set up tracer provider
    provider = TracerProvider(
        resource=Resource.create({
            "service.name": "flowmatch-api",
            "deployment.environment": settings.ENVIRONMENT
        })
    )

    # Export to Datadog/Jaeger
    exporter = OTLPSpanExporter(endpoint=settings.OTLP_ENDPOINT)
    provider.add_span_processor(BatchSpanProcessor(exporter))

    trace.set_tracer_provider(provider)

    # Auto-instrument
    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()
    SQLAlchemyInstrumentor().instrument(engine=engine)
    CeleryInstrumentor().instrument()

# Manual tracing for custom operations
tracer = trace.get_tracer(__name__)

async def execute_merge(match_id: str):
    with tracer.start_as_current_span("execute_merge") as span:
        span.set_attribute("match_id", match_id)

        # Fetch records
        with tracer.start_as_current_span("fetch_records"):
            record_a = await ghl_client.get_contact(match.record_a_id)
            record_b = await ghl_client.get_contact(match.record_b_id)

        # Create snapshot
        with tracer.start_as_current_span("create_snapshot"):
            snapshot = await create_merge_snapshot(record_a, record_b)
            span.set_attribute("snapshot_id", snapshot.id)

        # Execute merge in GHL
        with tracer.start_as_current_span("ghl_merge"):
            result = await ghl_client.update_contact(
                master_id,
                merged_data
            )

        span.set_attribute("merge.success", True)
        return result
```

## 6.6 SLO Definition

```yaml
# SLO Specification

service_level_objectives:
  - name: API Availability
    target: 99.9%
    window: 30 days
    indicator:
      type: availability
      good_events: "sum(rate(flowmatch_api_requests_total{status_code!~'5..'}[5m]))"
      total_events: "sum(rate(flowmatch_api_requests_total[5m]))"
    error_budget: 43.2 minutes/month

  - name: API Latency
    target: 99%
    window: 30 days
    indicator:
      type: latency
      threshold: 500ms
      good_events: "sum(rate(flowmatch_api_request_duration_seconds_bucket{le='0.5'}[5m]))"
      total_events: "sum(rate(flowmatch_api_request_duration_seconds_count[5m]))"

  - name: Merge Success Rate
    target: 99.5%
    window: 7 days
    indicator:
      type: quality
      good_events: "sum(rate(flowmatch_merges_executed_total[5m])) - sum(rate(flowmatch_merges_failed_total[5m]))"
      total_events: "sum(rate(flowmatch_merges_executed_total[5m]))"

  - name: Job Completion Rate
    target: 99%
    window: 7 days
    indicator:
      type: quality
      good_events: "sum(rate(flowmatch_celery_task_duration_seconds_count{status='success'}[5m]))"
      total_events: "sum(rate(flowmatch_celery_task_duration_seconds_count[5m]))"
```

---

# 7. MATCHING ENGINE EDGE CASES

## 7.1 Phone Number Handling

```python
# app/core/matching/normalizers/phone.py

import phonenumbers
from typing import Optional

class PhoneNormalizer:
    """Normalize phone numbers for comparison"""

    # Known invalid/placeholder values
    INVALID_VALUES = {
        "", "n/a", "na", "none", "null", "tbd", "unknown",
        "0000000000", "1111111111", "1234567890",
        "000-000-0000", "111-111-1111",
    }

    def normalize(self, phone: str, default_region: str = "US") -> Optional[str]:
        """
        Normalize phone number to E.164 format.
        Returns None for invalid/placeholder values.
        """
        if not phone:
            return None

        # Check for invalid values
        if phone.lower().strip() in self.INVALID_VALUES:
            return None

        # Strip common formatting
        cleaned = phone.strip()

        try:
            # Parse with phonenumbers library
            parsed = phonenumbers.parse(cleaned, default_region)

            # Validate
            if not phonenumbers.is_valid_number(parsed):
                return None

            # Format to E.164
            return phonenumbers.format_number(
                parsed,
                phonenumbers.PhoneNumberFormat.E164
            )

        except phonenumbers.NumberParseException:
            # Fallback: strip non-digits and validate length
            digits_only = ''.join(filter(str.isdigit, cleaned))

            if len(digits_only) < 7 or len(digits_only) > 15:
                return None

            return digits_only

    def compare(
        self,
        phone_a: str,
        phone_b: str,
        default_region: str = "US"
    ) -> float:
        """Compare two phone numbers, returning similarity score"""

        norm_a = self.normalize(phone_a, default_region)
        norm_b = self.normalize(phone_b, default_region)

        # Both null = can't compare
        if norm_a is None and norm_b is None:
            return 0.0

        # One null = no match
        if norm_a is None or norm_b is None:
            return 0.0

        # Exact match
        if norm_a == norm_b:
            return 1.0

        # Check if one is substring of other (e.g., country code difference)
        if norm_a.endswith(norm_b[-10:]) or norm_b.endswith(norm_a[-10:]):
            return 0.9

        return 0.0

# Test cases
"""
normalize("(555) 123-4567")       → "+15551234567"
normalize("+1-555-123-4567")      → "+15551234567"
normalize("555.123.4567")         → "+15551234567"
normalize("+44 20 7946 0958")     → "+442079460958"
normalize("")                     → None
normalize("N/A")                  → None
normalize("TBD")                  → None
normalize("0000000000")           → None
normalize("123")                  → None (too short)

compare("(555) 123-4567", "5551234567") → 1.0
compare("+1-555-123-4567", "555-123-4567") → 0.9
compare(None, "555-1234") → 0.0
"""
```

## 7.2 Email Handling

```python
# app/core/matching/normalizers/email.py

import re
from typing import Optional, Tuple

class EmailNormalizer:
    """Normalize and compare email addresses"""

    # Disposable email domains to flag
    DISPOSABLE_DOMAINS = {
        "mailinator.com", "guerrillamail.com", "tempmail.com",
        "throwaway.email", "10minutemail.com", "fakeinbox.com",
        # ... extended list
    }

    # Generic domains (don't use for company matching)
    GENERIC_DOMAINS = {
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
        "aol.com", "icloud.com", "protonmail.com", "mail.com",
    }

    def normalize(self, email: str) -> Optional[str]:
        """Normalize email for comparison"""
        if not email:
            return None

        email = email.lower().strip()

        # Basic validation
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return None

        return email

    def extract_parts(self, email: str) -> Optional[Tuple[str, str, str]]:
        """Extract local part, domain, and plus tag"""
        normalized = self.normalize(email)
        if not normalized:
            return None

        local, domain = normalized.split('@')

        # Handle plus addressing (john+sales@gmail.com)
        plus_tag = None
        if '+' in local:
            local, plus_tag = local.split('+', 1)

        return local, domain, plus_tag

    def extract_domain(self, email: str) -> Optional[str]:
        """Extract domain for company matching"""
        parts = self.extract_parts(email)
        if not parts:
            return None
        return parts[1]

    def is_disposable(self, email: str) -> bool:
        """Check if email is from disposable domain"""
        domain = self.extract_domain(email)
        return domain in self.DISPOSABLE_DOMAINS if domain else False

    def is_generic(self, email: str) -> bool:
        """Check if email is from generic provider"""
        domain = self.extract_domain(email)
        return domain in self.GENERIC_DOMAINS if domain else False

    def compare(self, email_a: str, email_b: str) -> float:
        """Compare two emails with smart matching"""

        norm_a = self.normalize(email_a)
        norm_b = self.normalize(email_b)

        if not norm_a or not norm_b:
            return 0.0

        # Exact match
        if norm_a == norm_b:
            return 1.0

        parts_a = self.extract_parts(email_a)
        parts_b = self.extract_parts(email_b)

        if not parts_a or not parts_b:
            return 0.0

        local_a, domain_a, tag_a = parts_a
        local_b, domain_b, tag_b = parts_b

        # Same local part and domain, different plus tags
        # john+sales@acme.com vs john+support@acme.com
        if local_a == local_b and domain_a == domain_b:
            return 0.95

        # Same domain only (for company matching)
        if domain_a == domain_b and not self.is_generic(email_a):
            return 0.5

        return 0.0

    def compare_domains(self, email_a: str, email_b: str) -> float:
        """Compare email domains for company matching"""
        domain_a = self.extract_domain(email_a)
        domain_b = self.extract_domain(email_b)

        if not domain_a or not domain_b:
            return 0.0

        # Skip generic domains
        if self.is_generic(email_a) or self.is_generic(email_b):
            return 0.0

        if domain_a == domain_b:
            return 1.0

        # Handle subdomain variations (mail.acme.com vs acme.com)
        if domain_a.endswith('.' + domain_b) or domain_b.endswith('.' + domain_a):
            return 0.9

        return 0.0
```

## 7.3 Name Handling

```python
# app/core/matching/normalizers/name.py

import re
import unicodedata
from typing import Optional
from jellyfish import jaro_winkler_similarity, soundex, metaphone

class NameNormalizer:
    """Normalize and compare names with international support"""

    # Common titles to remove
    TITLES = {
        "mr", "mrs", "ms", "miss", "dr", "prof", "sir", "madam",
        "jr", "sr", "ii", "iii", "iv", "esq", "phd", "md"
    }

    # Common suffixes
    SUFFIXES = {"jr", "sr", "ii", "iii", "iv", "esq", "phd", "md"}

    def normalize(self, name: str) -> Optional[str]:
        """Normalize name for comparison"""
        if not name:
            return None

        # Unicode normalization (José → Jose comparable)
        normalized = unicodedata.normalize('NFKD', name)
        # Remove diacritics
        normalized = ''.join(
            c for c in normalized
            if not unicodedata.combining(c)
        )

        # Lowercase
        normalized = normalized.lower()

        # Remove titles
        words = normalized.split()
        words = [w for w in words if w.strip('.') not in self.TITLES]

        # Remove punctuation
        normalized = ' '.join(words)
        normalized = re.sub(r'[^\w\s]', '', normalized)

        # Collapse whitespace
        normalized = ' '.join(normalized.split())

        return normalized if normalized else None

    def compare(self, name_a: str, name_b: str) -> float:
        """Compare two names using multiple strategies"""

        norm_a = self.normalize(name_a)
        norm_b = self.normalize(name_b)

        if not norm_a or not norm_b:
            return 0.0

        # Exact match after normalization
        if norm_a == norm_b:
            return 1.0

        # Jaro-Winkler similarity (good for typos)
        jw_score = jaro_winkler_similarity(norm_a, norm_b)

        # Phonetic matching (catches sound-alikes)
        phonetic_score = self._phonetic_score(norm_a, norm_b)

        # Token-based matching (handles reordering: "John Smith" vs "Smith, John")
        token_score = self._token_score(norm_a, norm_b)

        # Return best score
        return max(jw_score, phonetic_score, token_score)

    def _phonetic_score(self, name_a: str, name_b: str) -> float:
        """Compare using phonetic encoding"""
        try:
            # Soundex comparison
            soundex_a = soundex(name_a)
            soundex_b = soundex(name_b)
            if soundex_a == soundex_b:
                return 0.85

            # Metaphone comparison
            meta_a = metaphone(name_a)
            meta_b = metaphone(name_b)
            if meta_a == meta_b:
                return 0.85

        except Exception:
            pass

        return 0.0

    def _token_score(self, name_a: str, name_b: str) -> float:
        """Token-based comparison for reordered names"""
        tokens_a = set(name_a.split())
        tokens_b = set(name_b.split())

        if not tokens_a or not tokens_b:
            return 0.0

        # Jaccard similarity
        intersection = len(tokens_a & tokens_b)
        union = len(tokens_a | tokens_b)

        if union == 0:
            return 0.0

        jaccard = intersection / union

        # Boost if all tokens from shorter name are in longer
        if tokens_a <= tokens_b or tokens_b <= tokens_a:
            jaccard = min(1.0, jaccard + 0.1)

        return jaccard

# Test cases
"""
normalize("Dr. John Smith Jr.")    → "john smith"
normalize("José García")           → "jose garcia"
normalize("JOHN  SMITH")           → "john smith"

compare("John Smith", "Jon Smith") → ~0.92 (Jaro-Winkler)
compare("Smith, John", "John Smith") → ~0.95 (token match)
compare("Steven", "Stephen")       → ~0.85 (phonetic)
compare("José", "Jose")            → 1.0 (normalized)
"""
```

## 7.4 Company Name Handling

```python
# app/core/matching/normalizers/company.py

import re
from typing import Optional
from jellyfish import jaro_winkler_similarity

class CompanyNormalizer:
    """Normalize and compare company names"""

    # Legal suffixes to normalize
    LEGAL_SUFFIXES = {
        # Full forms → abbreviated
        "incorporated": "inc",
        "corporation": "corp",
        "limited": "ltd",
        "company": "co",
        "limited liability company": "llc",
        "professional corporation": "pc",
        "limited partnership": "lp",
        "public limited company": "plc",

        # Already abbreviated (keep as-is)
        "inc": "inc",
        "corp": "corp",
        "ltd": "ltd",
        "co": "co",
        "llc": "llc",
        "pc": "pc",
        "lp": "lp",
        "plc": "plc",
    }

    # Words to remove for matching
    NOISE_WORDS = {
        "the", "a", "an", "and", "&",
        "group", "holdings", "enterprises", "solutions",
        "services", "technologies", "consulting",
    }

    def normalize(self, name: str, keep_suffix: bool = False) -> Optional[str]:
        """Normalize company name"""
        if not name:
            return None

        normalized = name.lower().strip()

        # Replace & with 'and' for consistency
        normalized = normalized.replace('&', ' and ')

        # Remove punctuation except apostrophes
        normalized = re.sub(r"[^\w\s']", ' ', normalized)

        # Normalize legal suffixes
        words = normalized.split()
        processed_words = []
        suffix_found = None

        for word in words:
            word_clean = word.strip('.,')
            if word_clean in self.LEGAL_SUFFIXES:
                suffix_found = self.LEGAL_SUFFIXES[word_clean]
            elif word_clean not in self.NOISE_WORDS or keep_suffix:
                processed_words.append(word_clean)

        result = ' '.join(processed_words)

        if keep_suffix and suffix_found:
            result = f"{result} {suffix_found}"

        return result.strip() if result.strip() else None

    def compare(self, name_a: str, name_b: str) -> float:
        """Compare two company names"""

        # Normalize without suffix for comparison
        norm_a = self.normalize(name_a, keep_suffix=False)
        norm_b = self.normalize(name_b, keep_suffix=False)

        if not norm_a or not norm_b:
            return 0.0

        # Exact match
        if norm_a == norm_b:
            return 1.0

        # Jaro-Winkler similarity
        jw_score = jaro_winkler_similarity(norm_a, norm_b)

        # Boost if one is substring of other
        if norm_a in norm_b or norm_b in norm_a:
            jw_score = min(1.0, jw_score + 0.1)

        # Token overlap
        tokens_a = set(norm_a.split())
        tokens_b = set(norm_b.split())

        if tokens_a and tokens_b:
            overlap = len(tokens_a & tokens_b) / max(len(tokens_a), len(tokens_b))
            # Weight token overlap
            combined = (jw_score * 0.7) + (overlap * 0.3)
            return max(jw_score, combined)

        return jw_score

# Test cases
"""
normalize("Acme Inc.")              → "acme inc"
normalize("Acme Incorporated")      → "acme inc" (with keep_suffix=True)
normalize("The Acme Company, LLC")  → "acme llc"
normalize("ABC & Sons Ltd.")        → "abc sons ltd"

compare("Acme Inc", "Acme Incorporated") → ~0.95
compare("ABC Company", "ABC Co")         → ~0.90
compare("Smith & Sons", "Smith and Sons") → 1.0
"""
```

## 7.5 Large Dataset Handling

```python
# app/core/matching/batch_processor.py

from typing import AsyncGenerator, List
import asyncio
from dataclasses import dataclass

@dataclass
class BatchConfig:
    """Configuration for batch processing"""
    fetch_batch_size: int = 1000      # Records per GHL API call
    process_batch_size: int = 100     # Records per matching batch
    checkpoint_interval: int = 5000   # Save progress every N records
    max_concurrent_fetches: int = 5   # Parallel API calls
    timeout_minutes: int = 30         # Max job duration
    memory_limit_mb: int = 512        # Soft memory limit

class BatchProcessor:
    """Process large datasets with checkpointing and rate limiting"""

    def __init__(self, config: BatchConfig = None):
        self.config = config or BatchConfig()
        self.processed_count = 0
        self.checkpoint_data = {}

    async def process_location(
        self,
        location_id: str,
        job_id: str,
        resume_from: str = None
    ) -> AsyncGenerator[List[dict], None]:
        """
        Stream-process all records in a location.
        Yields batches of matches found.
        """
        start_time = asyncio.get_event_loop().time()

        # Resume from checkpoint if provided
        cursor = resume_from
        self.processed_count = 0

        try:
            async for records in self._fetch_records_stream(location_id, cursor):
                # Check timeout
                elapsed = asyncio.get_event_loop().time() - start_time
                if elapsed > self.config.timeout_minutes * 60:
                    await self._save_checkpoint(job_id, cursor)
                    raise JobTimeoutError(
                        f"Job timeout after {self.config.timeout_minutes} minutes",
                        checkpoint=cursor
                    )

                # Process batch
                matches = await self._process_batch(records)
                self.processed_count += len(records)

                # Checkpoint periodically
                if self.processed_count % self.config.checkpoint_interval == 0:
                    await self._save_checkpoint(job_id, cursor)
                    logger.info(
                        "Checkpoint saved",
                        processed=self.processed_count,
                        cursor=cursor
                    )

                if matches:
                    yield matches

                # Update cursor for next batch
                if records:
                    cursor = records[-1].get('id')

        except Exception as e:
            # Save checkpoint on error
            await self._save_checkpoint(job_id, cursor)
            raise

    async def _fetch_records_stream(
        self,
        location_id: str,
        start_cursor: str = None
    ) -> AsyncGenerator[List[dict], None]:
        """Fetch records in batches with rate limiting"""

        cursor = start_cursor
        has_more = True

        while has_more:
            # Fetch batch
            response = await ghl_client.get_contacts(
                location_id,
                limit=self.config.fetch_batch_size,
                startAfterId=cursor
            )

            records = response.get('contacts', [])
            has_more = len(records) == self.config.fetch_batch_size

            if records:
                cursor = records[-1]['id']
                yield records

            # Rate limit between fetches
            await asyncio.sleep(0.1)

    async def _process_batch(self, records: List[dict]) -> List[dict]:
        """Process a batch of records for duplicates"""

        matches = []

        # Use blocking to reduce comparisons
        blocks = self._create_blocks(records)

        for block_key, block_records in blocks.items():
            if len(block_records) < 2:
                continue

            # Compare within block
            for i, record_a in enumerate(block_records):
                for record_b in block_records[i+1:]:
                    score = await self._compare_records(record_a, record_b)

                    if score >= 0.70:  # Review threshold
                        matches.append({
                            'record_a': record_a,
                            'record_b': record_b,
                            'score': score
                        })

        return matches

    def _create_blocks(self, records: List[dict]) -> dict:
        """Create blocking keys to reduce comparison space"""

        blocks = {}

        for record in records:
            # Multiple blocking strategies
            keys = set()

            # Email domain blocking
            email = record.get('email', '')
            if email and '@' in email:
                domain = email.split('@')[1].lower()
                keys.add(f"domain:{domain}")

            # First 3 chars of name
            name = record.get('firstName', '') or record.get('name', '')
            if name and len(name) >= 3:
                keys.add(f"name:{name[:3].lower()}")

            # Phone area code
            phone = record.get('phone', '')
            digits = ''.join(filter(str.isdigit, phone))
            if len(digits) >= 3:
                keys.add(f"phone:{digits[:3]}")

            # Add record to all applicable blocks
            for key in keys:
                if key not in blocks:
                    blocks[key] = []
                blocks[key].append(record)

        return blocks

    async def _save_checkpoint(self, job_id: str, cursor: str):
        """Save processing checkpoint"""
        await redis.hset(
            f"job_checkpoint:{job_id}",
            mapping={
                'cursor': cursor,
                'processed_count': self.processed_count,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
```

## 7.6 Null/Empty Field Handling

```python
# app/core/matching/scoring.py

from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class FieldScore:
    score: Optional[float]  # None if can't compare
    weight: float
    match_type: str
    value_a: Any
    value_b: Any
    required: bool = False

def calculate_composite_score(
    field_scores: Dict[str, FieldScore]
) -> float:
    """
    Calculate composite match score with null handling.

    Rules:
    1. If a required field doesn't match (score=0), return 0
    2. If a required field is null on both sides, return 0
    3. If optional field is null, redistribute its weight
    4. Null vs value = 0.0 score (no match)
    5. Null vs null = None (skip from calculation)
    """

    # Check required fields first
    for field_name, fs in field_scores.items():
        if fs.required:
            # Required field with null on either side = fail
            if fs.value_a is None or fs.value_b is None:
                return 0.0
            # Required field that doesn't match = fail
            if fs.score is not None and fs.score < 0.5:
                return 0.0

    # Calculate score with weight redistribution
    total_weight = 0.0
    weighted_sum = 0.0

    for field_name, fs in field_scores.items():
        # Skip if can't compare (both null)
        if fs.score is None:
            continue

        # One null = 0 score but still counts against weight
        if fs.value_a is None or fs.value_b is None:
            # Don't add to weighted sum (effectively 0)
            total_weight += fs.weight
            continue

        weighted_sum += fs.score * fs.weight
        total_weight += fs.weight

    if total_weight == 0:
        return 0.0

    # Normalize by actual weight used
    return weighted_sum / total_weight

# Example usage:
field_scores = {
    "email": FieldScore(
        score=1.0,
        weight=0.4,
        match_type="exact",
        value_a="john@acme.com",
        value_b="john@acme.com",
        required=True
    ),
    "phone": FieldScore(
        score=None,  # Can't compare
        weight=0.3,
        match_type="normalized",
        value_a=None,
        value_b=None,
        required=False
    ),
    "name": FieldScore(
        score=0.92,
        weight=0.3,
        match_type="fuzzy",
        value_a="John Smith",
        value_b="Jon Smith",
        required=False
    ),
}

# Result: (1.0*0.4 + 0.92*0.3) / (0.4 + 0.3) = 0.676 / 0.7 = 0.966
# Phone is skipped (both null), weight redistributed
score = calculate_composite_score(field_scores)
```

---

# 8. FRONTEND SPECIFICATION

## 8.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   src/                                                                      │
│   ├── components/                                                           │
│   │   ├── ui/                    # Shadcn/UI primitives                    │
│   │   │   ├── button.tsx                                                   │
│   │   │   ├── card.tsx                                                     │
│   │   │   ├── dialog.tsx                                                   │
│   │   │   ├── select.tsx                                                   │
│   │   │   ├── table.tsx                                                    │
│   │   │   └── ...                                                          │
│   │   │                                                                     │
│   │   ├── layout/                # App layout components                    │
│   │   │   ├── Sidebar.tsx                                                  │
│   │   │   ├── Header.tsx                                                   │
│   │   │   └── PageContainer.tsx                                            │
│   │   │                                                                     │
│   │   ├── matches/               # Match-related components                 │
│   │   │   ├── MatchCard.tsx                                                │
│   │   │   ├── MatchList.tsx                                                │
│   │   │   ├── MatchDetail.tsx                                              │
│   │   │   ├── MergePreview.tsx                                             │
│   │   │   ├── FieldComparison.tsx                                          │
│   │   │   └── ConfidenceBadge.tsx                                          │
│   │   │                                                                     │
│   │   ├── rules/                 # Rule configuration                       │
│   │   │   ├── RuleList.tsx                                                 │
│   │   │   ├── RuleEditor.tsx                                               │
│   │   │   ├── FieldConfig.tsx                                              │
│   │   │   └── ThresholdSlider.tsx                                          │
│   │   │                                                                     │
│   │   ├── jobs/                  # Job management                           │
│   │   │   ├── JobList.tsx                                                  │
│   │   │   ├── JobScheduler.tsx                                             │
│   │   │   ├── JobProgress.tsx                                              │
│   │   │   └── JobHistory.tsx                                               │
│   │   │                                                                     │
│   │   └── common/                # Shared components                        │
│   │       ├── LoadingSpinner.tsx                                           │
│   │       ├── EmptyState.tsx                                               │
│   │       ├── ErrorBoundary.tsx                                            │
│   │       ├── ConfirmDialog.tsx                                            │
│   │       └── Pagination.tsx                                               │
│   │                                                                         │
│   ├── hooks/                     # Custom React hooks                       │
│   │   ├── useMatches.ts                                                    │
│   │   ├── useMerge.ts                                                      │
│   │   ├── useRules.ts                                                      │
│   │   ├── useJobs.ts                                                       │
│   │   └── useGHLContext.ts                                                 │
│   │                                                                         │
│   ├── services/                  # API client                               │
│   │   ├── api.ts                 # Base API client                         │
│   │   ├── matches.ts                                                       │
│   │   ├── merges.ts                                                        │
│   │   ├── rules.ts                                                         │
│   │   └── jobs.ts                                                          │
│   │                                                                         │
│   ├── stores/                    # State management (Zustand)               │
│   │   ├── matchStore.ts                                                    │
│   │   ├── ruleStore.ts                                                     │
│   │   └── uiStore.ts                                                       │
│   │                                                                         │
│   ├── pages/                     # Route pages                              │
│   │   ├── Dashboard.tsx                                                    │
│   │   ├── Duplicates.tsx                                                   │
│   │   ├── Rules.tsx                                                        │
│   │   ├── Jobs.tsx                                                         │
│   │   ├── History.tsx                                                      │
│   │   └── Settings.tsx                                                     │
│   │                                                                         │
│   └── lib/                       # Utilities                                │
│       ├── utils.ts                                                         │
│       ├── constants.ts                                                     │
│       └── types.ts                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 State Designs

### Loading States
```tsx
// components/common/LoadingSpinner.tsx
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
    </div>
  );
}

// Loading skeleton for match cards
export function MatchCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
```

### Empty States
```tsx
// components/common/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

// Usage examples
<EmptyState
  icon={<CheckCircleIcon className="h-12 w-12" />}
  title="No duplicates found"
  description="Great news! We haven't detected any duplicate records in your data."
  action={{ label: "Run Manual Scan", onClick: () => setShowScanModal(true) }}
/>

<EmptyState
  icon={<ClipboardListIcon className="h-12 w-12" />}
  title="No match rules configured"
  description="Create your first match rule to start detecting duplicates."
  action={{ label: "Create Rule", onClick: () => navigate("/rules/new") }}
/>
```

### Error States
```tsx
// components/common/ErrorState.tsx
interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <ExclamationCircleIcon className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry}>Try Again</Button>
        )}
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
}

// Error boundary wrapper
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring
    console.error("ErrorBoundary caught:", error, errorInfo);
    // Send to Sentry/Datadog
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState
          error={this.state.error!}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Success States
```tsx
// components/common/SuccessToast.tsx
export function SuccessToast({ message, onUndo }: { message: string; onUndo?: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <span className="text-green-800">{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          className="ml-auto text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Undo
        </button>
      )}
    </div>
  );
}

// Merge success modal
export function MergeSuccessModal({ merge, onClose, onUndo }: MergeSuccessProps) {
  return (
    <Dialog open onClose={onClose}>
      <div className="text-center py-6">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">Merge Complete</h3>
        <p className="text-gray-500 mb-6">
          Records have been successfully merged into {merge.masterRecordId}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onUndo}>
            Undo Merge
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          You can undo this merge within 30 days
        </p>
      </div>
    </Dialog>
  );
}
```

## 8.3 Accessibility Requirements (WCAG 2.1 AA)

```tsx
// Accessibility utilities

// Focus management for modals
export function useFocusTrap(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
}

// Announce to screen readers
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', priority);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    el.textContent = message;

    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 1000);
  }, []);

  return announce;
}

// Usage in merge flow
function MergeButton({ matchId }: { matchId: string }) {
  const announce = useAnnounce();
  const { mutate: executeMerge, isLoading } = useMerge();

  const handleMerge = () => {
    executeMerge(matchId, {
      onSuccess: () => {
        announce('Merge completed successfully');
      },
      onError: (error) => {
        announce(`Merge failed: ${error.message}`, 'assertive');
      },
    });
  };

  return (
    <Button
      onClick={handleMerge}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Merging records...' : 'Merge duplicate records'}
    >
      {isLoading ? 'Merging...' : 'Merge'}
    </Button>
  );
}

// Color contrast checker (for dynamic styling)
function getContrastColor(backgroundColor: string): string {
  // Parse hex color
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on contrast
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

## 8.4 Responsive Breakpoints

```css
/* tailwind.config.js extensions */
module.exports = {
  theme: {
    screens: {
      'mobile': '320px',      /* GHL mobile app minimum */
      'sm': '640px',
      'md': '768px',          /* Tablet */
      'lg': '1024px',         /* Desktop */
      'xl': '1280px',
      'embedded': '400px',    /* GHL embedded sidebar width */
    },
  },
}

/* Responsive component example */
.match-card {
  /* Mobile: Stack layout */
  @apply flex flex-col gap-4 p-4;

  /* Tablet+: Side by side */
  @screen md {
    @apply flex-row;
  }
}

.dashboard-grid {
  /* Mobile: Single column */
  @apply grid grid-cols-1 gap-4;

  /* Tablet: 2 columns */
  @screen md {
    @apply grid-cols-2;
  }

  /* Desktop: 3 columns */
  @screen lg {
    @apply grid-cols-3;
  }
}

/* GHL embedded sidebar specific */
@media (max-width: 400px) {
  .sidebar-embedded {
    /* Compact mode for narrow sidebar */
    .nav-label { @apply hidden; }
    .card-actions { @apply flex-col; }
  }
}
```

## 8.5 Keyboard Shortcuts

```tsx
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: 'k', ctrl: true, action: () => openCommandPalette(), description: 'Open command palette' },
  { key: 'a', ctrl: true, action: () => approveCurrentMatch(), description: 'Approve current match' },
  { key: 'r', ctrl: true, action: () => rejectCurrentMatch(), description: 'Reject current match' },
  { key: 'j', action: () => selectNextMatch(), description: 'Select next match' },
  { key: 'k', action: () => selectPreviousMatch(), description: 'Select previous match' },
  { key: 'Enter', action: () => openMergePreview(), description: 'Open merge preview' },
  { key: 'Escape', action: () => closeModal(), description: 'Close modal' },
  { key: '?', shift: true, action: () => showShortcutsHelp(), description: 'Show shortcuts' },
];

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      for (const shortcut of SHORTCUTS) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

// Keyboard shortcuts help modal
export function ShortcutsHelpModal() {
  return (
    <Dialog>
      <h2 className="text-lg font-medium mb-4">Keyboard Shortcuts</h2>
      <div className="space-y-2">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.key} className="flex justify-between">
            <span className="text-gray-600">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
              {shortcut.ctrl && 'Ctrl+'}
              {shortcut.shift && 'Shift+'}
              {shortcut.alt && 'Alt+'}
              {shortcut.key.toUpperCase()}
            </kbd>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
```

## 8.6 User Flow Diagrams

### OAuth Connection Flow

```mermaid
flowchart TD
    A[User clicks 'Install MergeMatch'] --> B[GHL Marketplace]
    B --> C{User logged in?}
    C -->|No| D[GHL Login]
    D --> C
    C -->|Yes| E[Authorization Screen]
    E --> F{User approves?}
    F -->|No| G[Return to Marketplace]
    F -->|Yes| H[Redirect to MergeMatch]
    H --> I[Exchange code for tokens]
    I --> J{First time?}
    J -->|Yes| K[Show Onboarding Wizard]
    J -->|No| L[Show Dashboard]
    K --> M[Select Locations]
    M --> N[Configure Default Rules]
    N --> O[Run Initial Scan]
    O --> L

    style K fill:#e1f5fe
    style L fill:#c8e6c9
```

### Duplicate Review Workflow

```mermaid
flowchart TD
    A[Dashboard: Pending Duplicates] --> B[Click match pair]
    B --> C[Side-by-side comparison view]
    C --> D{User decision}

    D -->|Approve| E[Select master record]
    E --> F[Choose field values]
    F --> G[Preview merged record]
    G --> H{Confirm?}
    H -->|Yes| I[Execute merge]
    H -->|No| F

    D -->|Reject| J[Enter rejection reason]
    J --> K[Mark as not duplicate]

    D -->|Skip| L[Move to next pair]

    I --> M{More pending?}
    K --> M
    L --> M
    M -->|Yes| B
    M -->|No| N[Show summary toast]

    style I fill:#c8e6c9
    style K fill:#ffcdd2
    style L fill:#fff9c4
```

### Merge Execution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FM as MergeMatch
    participant GHL as GHL API
    participant DB as Database

    U->>FM: Click "Merge"
    FM->>FM: Validate permissions
    FM->>DB: Create merge record (pending)

    FM->>GHL: GET master record
    FM->>GHL: GET duplicate record
    GHL-->>FM: Record data

    FM->>FM: Compute merged values
    FM->>GHL: PUT master with merged data
    GHL-->>FM: 200 OK

    FM->>GHL: Reassign activities
    FM->>GHL: Reassign notes
    FM->>GHL: Reassign deals

    FM->>GHL: DELETE duplicate
    GHL-->>FM: 200 OK

    FM->>DB: Update merge (completed)
    FM-->>U: Success + Undo option

    Note over FM,DB: Undo available for 30 days
```

## 8.7 Microcopy Guidelines

### Tone Principles

| Principle | Do | Don't |
|-----------|-----|-------|
| **Clear** | "3 duplicates found" | "We've identified potential duplicate records" |
| **Actionable** | "Review duplicates" | "Duplicates exist in your data" |
| **Reassuring** | "You can undo this merge" | "This action is irreversible" |
| **Concise** | "Merge complete" | "The merge operation has been successfully completed" |

### Standard UI Copy

```typescript
// constants/copy.ts

export const COPY = {
  // Empty states
  empty: {
    noDuplicates: {
      title: "No duplicates found",
      description: "Your data is clean! We'll notify you when new duplicates are detected.",
      action: "Run a scan"
    },
    noRules: {
      title: "No match rules configured",
      description: "Create rules to define how duplicates are detected.",
      action: "Create first rule"
    },
    noHistory: {
      title: "No merge history yet",
      description: "Merged records will appear here with full audit trail.",
      action: null
    }
  },

  // Confirmations
  confirm: {
    merge: "Merge these records? The duplicate will be removed and its data combined into the master record.",
    bulkMerge: (count: number) => `Merge ${count} record pairs? This may take a few minutes.`,
    deleteRule: "Delete this rule? Existing matches found by this rule will remain.",
    undo: "Undo this merge? The duplicate record will be restored."
  },

  // Success messages
  success: {
    merged: "Records merged successfully",
    undone: "Merge undone — duplicate restored",
    ruleCreated: "Rule created — scanning for matches",
    scanComplete: (count: number) => `Scan complete: ${count} new duplicates found`
  },

  // Error messages
  error: {
    mergeFailed: "Merge failed — please try again",
    connectionLost: "Connection to GHL lost — reconnecting...",
    rateLimited: "Too many requests — please wait a moment",
    sessionExpired: "Session expired — please log in again"
  },

  // Loading states
  loading: {
    scanning: "Scanning for duplicates...",
    merging: "Merging records...",
    loading: "Loading...",
    syncing: "Syncing with GHL..."
  },

  // Tooltips
  tooltip: {
    confidenceScore: "How likely these are duplicates (0-100%). Higher = more confident.",
    autoMerge: "Records above this threshold merge automatically without review.",
    masterRecord: "The record that will be kept. Data from both records is combined."
  },

  // Match Type Explanations (for rule configuration UI)
  matchTypes: {
    exact: {
      name: "Exact Match",
      description: "Values must be identical (case-sensitive)",
      example: '"john@acme.com" = "john@acme.com" ✓'
    },
    exact_normalized: {
      name: "Exact (Ignore Case)",
      description: "Values must match, ignoring uppercase/lowercase and extra spaces",
      example: '"JOHN@acme.com" = "john@acme.com" ✓'
    },
    fuzzy: {
      name: "Similar Text",
      description: "Finds typos and slight variations in text",
      example: '"Jon Smith" ≈ "John Smith" (93% match) ✓'
    },
    phone_normalized: {
      name: "Phone Number",
      description: "Matches phone numbers regardless of formatting",
      example: '"(555) 123-4567" = "5551234567" ✓'
    },
    domain: {
      name: "Email Domain",
      description: "Matches if email domains are the same",
      example: '"john@acme.com" matches "jane@acme.com" ✓'
    },
    phonetic: {
      name: "Sounds Like",
      description: "Matches names that sound similar when spoken",
      example: '"Smith" = "Smyth" ✓'
    }
  },

  // Threshold Slider Labels
  thresholds: {
    sensitivity: {
      label: "Match Sensitivity",
      helpText: "Higher = more strict (fewer matches, more accurate). Lower = more loose (more matches, may include false positives).",
      strict: "Strict",
      loose: "Loose"
    },
    autoMerge: {
      label: "Auto-Merge Threshold",
      helpText: "Records above this confidence level will merge automatically without review."
    },
    review: {
      label: "Review Threshold",
      helpText: "Records between this and auto-merge will be queued for manual review."
    }
  }
} as const;
```

### Error Message Patterns

| Error Code | User-Facing Message | Recovery Action |
|------------|--------------------|--------------------|
| FM-1001 | "Session expired" | "Log in again" button |
| FM-2003 | "GHL is temporarily unavailable" | "Retry" button + auto-retry |
| FM-3002 | "Record was modified since scan" | "Refresh" to reload |
| FM-4001 | "Rate limit reached" | Countdown timer + auto-retry |

## 8.8 Empty State Designs

### No Duplicates Found

```tsx
// components/states/EmptyDuplicates.tsx
export function EmptyDuplicates() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircleIcon className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No duplicates found
      </h3>
      <p className="text-gray-500 max-w-sm mb-6">
        Your data is clean! We'll notify you when new duplicates are detected.
      </p>
      <Button variant="outline" onClick={triggerScan}>
        <RefreshIcon className="w-4 h-4 mr-2" />
        Run a scan
      </Button>
    </div>
  );
}
```

### First Time Setup

```tsx
// components/states/OnboardingEmpty.tsx
export function OnboardingEmpty() {
  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="text-center mb-8">
        <SparklesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to MergeMatch</h2>
        <p className="text-gray-600">
          Let's set up duplicate detection for your GHL account.
        </p>
      </div>

      <div className="space-y-4">
        <StepCard
          number={1}
          title="Select locations"
          description="Choose which locations to scan"
          status="current"
        />
        <StepCard
          number={2}
          title="Configure rules"
          description="Define how duplicates are matched"
          status="upcoming"
        />
        <StepCard
          number={3}
          title="Run first scan"
          description="Find existing duplicates"
          status="upcoming"
        />
      </div>

      <div className="mt-8 text-center">
        <Button size="lg">Get Started</Button>
        <p className="text-sm text-gray-500 mt-2">Takes about 2 minutes</p>
      </div>
    </div>
  );
}
```

### Error State

```tsx
// components/states/ErrorState.tsx
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorInfo = getErrorInfo(error.code);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ExclamationIcon className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {errorInfo.title}
      </h3>
      <p className="text-gray-500 max-w-sm mb-1">
        {errorInfo.message}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Error code: {error.code}
      </p>
      {errorInfo.recoverable && (
        <Button onClick={onRetry}>
          {errorInfo.actionLabel || 'Try again'}
        </Button>
      )}
      <a
        href="/help/errors"
        className="text-sm text-blue-600 hover:text-blue-800 mt-4"
      >
        Learn more about this error
      </a>
    </div>
  );
}
```

### Loading State Skeletons

```tsx
// components/states/MatchListSkeleton.tsx
export function MatchListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            {/* Score skeleton */}
            <div className="w-16 h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

# 9. BILLING & PRICING

## 9.1 Pricing Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLOWMATCH PRICING                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   STARTER                  PRO                      ENTERPRISE              │
│   $29/mo                   $79/mo                   $149/mo                 │
│   per location             per location             per location            │
│                                                                             │
│   ✓ 1 location            ✓ Up to 5 locations      ✓ Unlimited locations   │
│   ✓ 5,000 records         ✓ 25,000 records         ✓ 100,000 records       │
│   ✓ Manual scans          ✓ Scheduled scans        ✓ Real-time matching    │
│   ✓ Basic matching        ✓ Advanced matching      ✓ Custom match rules    │
│   ✓ 30-day history        ✓ 90-day history         ✓ 1-year history        │
│   ✓ Email support         ✓ Priority support       ✓ Dedicated support     │
│   ✗ Auto-merge            ✓ Auto-merge             ✓ Auto-merge            │
│   ✗ API access            ✗ API access             ✓ API access            │
│   ✗ White-label           ✗ White-label            ✓ White-label           │
│                                                                             │
│   [Start Free Trial]      [Start Free Trial]       [Contact Sales]         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 9.2 Stripe Integration

```python
# app/billing/stripe_service.py

import stripe
from typing import Optional
from datetime import datetime

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Handle Stripe billing operations"""

    # Product and Price IDs
    PRODUCTS = {
        "starter": {
            "product_id": "prod_starter",
            "price_monthly": "price_starter_monthly",
            "price_yearly": "price_starter_yearly",
        },
        "pro": {
            "product_id": "prod_pro",
            "price_monthly": "price_pro_monthly",
            "price_yearly": "price_pro_yearly",
        },
        "enterprise": {
            "product_id": "prod_enterprise",
            "price_monthly": "price_enterprise_monthly",
            "price_yearly": "price_enterprise_yearly",
        },
    }

    async def create_checkout_session(
        self,
        tenant_id: str,
        plan: str,
        billing_period: str = "monthly",
        success_url: str = None,
        cancel_url: str = None,
    ) -> str:
        """Create Stripe Checkout session"""

        price_id = self.PRODUCTS[plan][f"price_{billing_period}"]

        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=success_url or f"{settings.APP_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=cancel_url or f"{settings.APP_URL}/billing/cancel",
            metadata={
                "tenant_id": tenant_id,
                "plan": plan,
            },
            subscription_data={
                "metadata": {
                    "tenant_id": tenant_id,
                    "plan": plan,
                },
                "trial_period_days": 14,  # 14-day free trial
            },
            customer_email=tenant.email,  # Pre-fill email
            allow_promotion_codes=True,
        )

        return session.url

    async def handle_webhook(self, payload: bytes, signature: str) -> dict:
        """Process Stripe webhook events"""

        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid webhook signature")

        # Handle different event types
        handlers = {
            "checkout.session.completed": self._handle_checkout_completed,
            "invoice.paid": self._handle_invoice_paid,
            "invoice.payment_failed": self._handle_payment_failed,
            "customer.subscription.updated": self._handle_subscription_updated,
            "customer.subscription.deleted": self._handle_subscription_deleted,
        }

        handler = handlers.get(event["type"])
        if handler:
            await handler(event["data"]["object"])

        return {"status": "processed", "type": event["type"]}

    async def _handle_checkout_completed(self, session: dict):
        """Handle successful checkout"""
        tenant_id = session["metadata"]["tenant_id"]
        plan = session["metadata"]["plan"]
        subscription_id = session["subscription"]

        # Update tenant subscription
        await self.tenant_repo.update(tenant_id, {
            "stripe_subscription_id": subscription_id,
            "stripe_customer_id": session["customer"],
            "plan": plan,
            "billing_status": "active",
            "trial_ends_at": datetime.fromtimestamp(
                session.get("subscription", {}).get("trial_end", 0)
            ) if session.get("subscription", {}).get("trial_end") else None,
        })

        # Send welcome email
        await email_service.send_welcome_email(tenant_id, plan)

    async def _handle_payment_failed(self, invoice: dict):
        """Handle failed payment - start dunning process"""
        subscription_id = invoice["subscription"]
        tenant = await self.tenant_repo.get_by_subscription(subscription_id)

        if not tenant:
            return

        attempt_count = invoice.get("attempt_count", 1)

        if attempt_count == 1:
            # First failure - send warning email
            await email_service.send_payment_failed_email(tenant.id)

        elif attempt_count == 2:
            # Second failure - send urgent warning
            await email_service.send_payment_urgent_email(tenant.id)

        elif attempt_count >= 3:
            # Third failure - suspend account
            await self.tenant_repo.update(tenant.id, {
                "billing_status": "suspended",
            })
            await email_service.send_account_suspended_email(tenant.id)

    async def _handle_subscription_deleted(self, subscription: dict):
        """Handle subscription cancellation"""
        tenant = await self.tenant_repo.get_by_subscription(subscription["id"])

        if tenant:
            await self.tenant_repo.update(tenant.id, {
                "billing_status": "cancelled",
                "plan": "free",
            })

    async def create_portal_session(self, tenant_id: str) -> str:
        """Create Stripe Customer Portal session for self-service"""
        tenant = await self.tenant_repo.get(tenant_id)

        session = stripe.billing_portal.Session.create(
            customer=tenant.stripe_customer_id,
            return_url=f"{settings.APP_URL}/settings/billing",
        )

        return session.url
```

## 9.3 Usage Tracking

```python
# app/billing/usage_tracker.py

from datetime import datetime, timedelta
from typing import Optional

class UsageTracker:
    """Track usage for billing enforcement"""

    LIMITS = {
        "starter": {"records": 5000, "locations": 1},
        "pro": {"records": 25000, "locations": 5},
        "enterprise": {"records": 100000, "locations": None},  # Unlimited
    }

    async def get_usage(self, tenant_id: str) -> dict:
        """Get current billing period usage"""

        tenant = await self.tenant_repo.get(tenant_id)

        # Get billing period start
        period_start = await self._get_period_start(tenant)

        # Count records scanned this period
        records_scanned = await self.db.fetchval("""
            SELECT COALESCE(SUM(records_scanned), 0)
            FROM dedup_job_runs
            WHERE tenant_id = $1
            AND started_at >= $2
        """, tenant_id, period_start)

        # Count active locations
        active_locations = await self.db.fetchval("""
            SELECT COUNT(*)
            FROM locations
            WHERE tenant_id = $1 AND is_active = true
        """, tenant_id)

        limits = self.LIMITS.get(tenant.plan, self.LIMITS["starter"])

        return {
            "period_start": period_start.isoformat(),
            "records_scanned": records_scanned,
            "records_limit": limits["records"],
            "records_percent": (records_scanned / limits["records"]) * 100 if limits["records"] else 0,
            "locations_active": active_locations,
            "locations_limit": limits["locations"],
        }

    async def check_can_scan(self, tenant_id: str, estimated_records: int) -> tuple[bool, Optional[str]]:
        """Check if tenant can perform scan"""

        usage = await self.get_usage(tenant_id)
        limits = self.LIMITS.get(usage.get("plan", "starter"), self.LIMITS["starter"])

        # Check record limit
        if limits["records"]:
            new_total = usage["records_scanned"] + estimated_records
            if new_total > limits["records"]:
                return False, f"Record limit exceeded. {usage['records_scanned']}/{limits['records']} used this period."

        return True, None

    async def check_can_add_location(self, tenant_id: str) -> tuple[bool, Optional[str]]:
        """Check if tenant can add another location"""

        usage = await self.get_usage(tenant_id)
        tenant = await self.tenant_repo.get(tenant_id)
        limits = self.LIMITS.get(tenant.plan, self.LIMITS["starter"])

        # Enterprise has unlimited
        if limits["locations"] is None:
            return True, None

        if usage["locations_active"] >= limits["locations"]:
            return False, f"Location limit reached. Upgrade to add more locations."

        return True, None

    async def record_usage(self, tenant_id: str, records_scanned: int):
        """Record usage for a scan"""

        # Check if approaching limit (80%)
        usage = await self.get_usage(tenant_id)
        limits = self.LIMITS.get(usage.get("plan", "starter"), self.LIMITS["starter"])

        if limits["records"]:
            new_total = usage["records_scanned"] + records_scanned
            percent = (new_total / limits["records"]) * 100

            if percent >= 80 and usage["records_percent"] < 80:
                # Send warning email
                await email_service.send_usage_warning_email(tenant_id, percent)

            if percent >= 100:
                # Send limit reached email
                await email_service.send_limit_reached_email(tenant_id)
```

## 9.4 GHL Marketplace Integration

```python
# app/billing/ghl_marketplace.py

"""
GHL Marketplace charges agencies via Wallet API.
Revenue share: GHL takes ~20-30% (confirm current rate).
"""

class GHLMarketplaceBilling:
    """Handle billing through GHL Marketplace"""

    async def charge_location(
        self,
        location_id: str,
        amount_cents: int,
        description: str,
    ) -> dict:
        """
        Charge a location via GHL Wallet Charges API.
        This charges the agency's wallet, which they pass to their client.
        """

        access_token = await self.get_location_token(location_id)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://services.leadconnectorhq.com/payments/wallet-charges",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "locationId": location_id,
                    "amount": amount_cents,
                    "currency": "USD",
                    "description": description,
                    "metadata": {
                        "app": "flowmatch",
                        "period": datetime.utcnow().strftime("%Y-%m"),
                    }
                }
            )
            response.raise_for_status()
            return response.json()

    async def get_subscription_status(self, location_id: str) -> dict:
        """Check if location has active MergeMatch subscription via GHL"""

        # Query GHL for subscription status
        access_token = await self.get_location_token(location_id)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://services.leadconnectorhq.com/saas-api/subscriptions",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"locationId": location_id}
            )

            if response.status_code == 200:
                subscriptions = response.json().get("subscriptions", [])
                flowmatch_sub = next(
                    (s for s in subscriptions if s.get("appId") == settings.GHL_APP_ID),
                    None
                )
                return flowmatch_sub

        return None
```

---

# 10. DATA MIGRATION & ONBOARDING

## 10.1 Initial Scan Wizard

```tsx
// components/onboarding/InitialScanWizard.tsx

interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'connect', title: 'Connect Data', component: ConnectStep },
  { id: 'configure', title: 'Configure Rules', component: ConfigureStep },
  { id: 'scan', title: 'Initial Scan', component: ScanStep },
  { id: 'review', title: 'Review Results', component: ReviewStep },
];

export function InitialScanWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({});

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {WIZARD_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentStep ? 'bg-blue-600 text-white' :
              index === currentStep ? 'border-2 border-blue-600' :
              'border-2 border-gray-300'
            }`}>
              {index < currentStep ? <CheckIcon /> : index + 1}
            </div>
            <span className="ml-2 text-sm">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6">
        {React.createElement(WIZARD_STEPS[currentStep].component, {
          data: wizardData,
          onUpdate: (data) => setWizardData({ ...wizardData, ...data }),
          onNext: () => setCurrentStep(currentStep + 1),
          onBack: () => setCurrentStep(currentStep - 1),
        })}
      </div>
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep({ onNext }) {
  return (
    <div className="text-center">
      <SparklesIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Welcome to MergeMatch</h2>
      <p className="text-gray-600 mb-6">
        Let's set up duplicate detection for your GoHighLevel account.
        This wizard will guide you through the initial configuration.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-medium mb-2">What we'll do:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
            Connect to your GHL location data
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
            Configure matching rules for your needs
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
            Run an initial scan to find existing duplicates
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
            Review and merge duplicates (optional)
          </li>
        </ul>
      </div>
      <Button onClick={onNext} size="lg">Get Started</Button>
    </div>
  );
}

// Step 2: Connect (shows what data will be accessed)
function ConnectStep({ onNext, onBack }) {
  const { data: locationData, isLoading } = useLocationData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Data Overview</h2>
      <p className="text-gray-600 mb-6">
        Here's what we found in your GoHighLevel location:
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {locationData.contactCount.toLocaleString()}
          </div>
          <div className="text-gray-500">Contacts</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {locationData.companyCount.toLocaleString()}
          </div>
          <div className="text-gray-500">Companies</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {locationData.opportunityCount.toLocaleString()}
          </div>
          <div className="text-gray-500">Opportunities</div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <InformationCircleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-800">
              Based on your data size, the initial scan will take approximately{' '}
              <strong>{estimateScanTime(locationData.contactCount)}</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

// Step 3: Configure rules (with presets)
function ConfigureStep({ data, onUpdate, onNext, onBack }) {
  const [selectedPreset, setSelectedPreset] = useState('standard');

  const PRESETS = {
    conservative: {
      name: 'Conservative',
      description: 'Strict matching - only merge clear duplicates',
      autoMergeThreshold: 0.98,
      reviewThreshold: 0.85,
    },
    standard: {
      name: 'Standard (Recommended)',
      description: 'Balanced matching for most use cases',
      autoMergeThreshold: 0.95,
      reviewThreshold: 0.70,
    },
    aggressive: {
      name: 'Aggressive',
      description: 'Catch more duplicates - more manual review needed',
      autoMergeThreshold: 0.90,
      reviewThreshold: 0.60,
    },
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Configure Matching</h2>
      <p className="text-gray-600 mb-6">
        Choose how strict you want duplicate detection to be:
      </p>

      <div className="space-y-3 mb-6">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <label
            key={key}
            className={`block border rounded-lg p-4 cursor-pointer ${
              selectedPreset === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="preset"
              value={key}
              checked={selectedPreset === key}
              onChange={() => setSelectedPreset(key)}
              className="sr-only"
            />
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-500">{preset.description}</div>
              </div>
              {selectedPreset === key && (
                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </label>
        ))}
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-sm text-blue-600">
          Advanced settings
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Detailed threshold sliders */}
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={() => {
          onUpdate({ matchingPreset: selectedPreset, ...PRESETS[selectedPreset] });
          onNext();
        }}>Continue</Button>
      </div>
    </div>
  );
}

// Step 4: Run initial scan
function ScanStep({ data, onNext, onBack }) {
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const startScan = async () => {
    setScanStatus('running');

    const job = await api.post('/matches/scan', {
      location_id: data.locationId,
      initial_scan: true,
    });

    // Poll for progress
    const interval = setInterval(async () => {
      const status = await api.get(`/jobs/runs/${job.run_id}`);
      setProgress(status.progress_percent);

      if (status.status === 'completed') {
        clearInterval(interval);
        setResults(status);
        setScanStatus('complete');
      }
    }, 2000);
  };

  if (scanStatus === 'idle') {
    return (
      <div className="text-center">
        <SearchIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">Ready to Scan</h2>
        <p className="text-gray-600 mb-6">
          We'll scan your {data.contactCount?.toLocaleString()} contacts
          to find potential duplicates.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={startScan}>Start Scan</Button>
        </div>
      </div>
    );
  }

  if (scanStatus === 'running') {
    return (
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64" cy="64" r="56"
              stroke="#E5E7EB" strokeWidth="8" fill="none"
            />
            <circle
              cx="64" cy="64" r="56"
              stroke="#3B82F6" strokeWidth="8" fill="none"
              strokeDasharray={`${progress * 3.51} 351.68`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{progress}%</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Scanning...</h2>
        <p className="text-gray-500">This may take a few minutes</p>
      </div>
    );
  }

  // Complete
  return (
    <div className="text-center">
      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-4">Scan Complete!</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {results.records_scanned.toLocaleString()}
          </div>
          <div className="text-gray-500">Records Scanned</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {results.matches_found.toLocaleString()}
          </div>
          <div className="text-gray-500">Duplicates Found</div>
        </div>
      </div>
      <Button onClick={onNext}>Review Duplicates</Button>
    </div>
  );
}
```

## 10.2 Demo Data Seeder

```python
# scripts/seed_demo_data.py

"""
Seed demo data for sandbox/testing environments.
Creates realistic duplicate scenarios for demonstration.
"""

import asyncio
from faker import Faker
import random

fake = Faker()

DEMO_SCENARIOS = [
    # Exact email duplicates
    {
        "type": "exact_email",
        "count": 10,
        "generator": lambda: {
            "base": {
                "firstName": fake.first_name(),
                "lastName": fake.last_name(),
                "email": fake.email(),
                "phone": fake.phone_number(),
                "companyName": fake.company(),
            },
            "duplicate": lambda base: {
                **base,
                "firstName": base["firstName"].upper(),  # Different case
                "phone": "",  # Missing phone
            }
        }
    },

    # Fuzzy name duplicates
    {
        "type": "fuzzy_name",
        "count": 15,
        "generator": lambda: {
            "base": {
                "firstName": "John",
                "lastName": "Smith",
                "email": f"john.smith.{random.randint(1,999)}@{fake.domain_name()}",
                "phone": fake.phone_number(),
            },
            "duplicate": lambda base: {
                "firstName": random.choice(["Jon", "Jhon", "Jonathan"]),
                "lastName": "Smith",
                "email": f"jsmith.{random.randint(1,999)}@{fake.domain_name()}",
                "phone": base["phone"],  # Same phone
            }
        }
    },

    # Company variations
    {
        "type": "company_variation",
        "count": 8,
        "generator": lambda: {
            "base": {
                "firstName": fake.first_name(),
                "lastName": fake.last_name(),
                "email": f"{fake.first_name().lower()}@acme.com",
                "companyName": "Acme Inc",
            },
            "duplicate": lambda base: {
                **base,
                "email": f"{fake.first_name().lower()}@acme.com",
                "companyName": random.choice([
                    "Acme Incorporated",
                    "ACME Inc.",
                    "Acme, Inc",
                    "The Acme Company"
                ]),
            }
        }
    },

    # Phone format variations
    {
        "type": "phone_format",
        "count": 12,
        "generator": lambda: {
            "phone_base": f"{random.randint(200,999)}{random.randint(200,999)}{random.randint(1000,9999)}",
            "base": lambda pb: {
                "firstName": fake.first_name(),
                "lastName": fake.last_name(),
                "email": fake.email(),
                "phone": f"({pb[:3]}) {pb[3:6]}-{pb[6:]}",
            },
            "duplicate": lambda base, pb: {
                "firstName": base["firstName"],
                "lastName": base["lastName"],
                "email": fake.email(),  # Different email
                "phone": random.choice([
                    f"+1-{pb[:3]}-{pb[3:6]}-{pb[6:]}",
                    f"{pb[:3]}.{pb[3:6]}.{pb[6:]}",
                    pb,  # Raw digits
                ]),
            }
        }
    },
]

async def seed_demo_data(location_id: str, ghl_client):
    """Create demo duplicate records in GHL"""

    created_pairs = []

    for scenario in DEMO_SCENARIOS:
        for _ in range(scenario["count"]):
            gen = scenario["generator"]()

            # Create base record
            base_data = gen["base"] if callable(gen["base"]) else gen["base"]
            if callable(base_data):
                base_data = base_data(gen.get("phone_base", ""))

            base_record = await ghl_client.create_contact(location_id, base_data)

            # Create duplicate
            dup_data = gen["duplicate"](base_data)
            if "phone_base" in gen:
                dup_data = gen["duplicate"](base_data, gen["phone_base"])

            dup_record = await ghl_client.create_contact(location_id, dup_data)

            created_pairs.append({
                "scenario": scenario["type"],
                "base_id": base_record["id"],
                "duplicate_id": dup_record["id"],
            })

    return created_pairs
```

---

# 11. DOCUMENTATION STRATEGY

## 11.1 Documentation Structure

```
docs/
├── getting-started/
│   ├── quickstart.md           # 5-minute setup guide
│   ├── installation.md         # GHL marketplace installation
│   ├── first-scan.md           # Running your first scan
│   └── understanding-matches.md # How matching works
│
├── user-guide/
│   ├── dashboard.md            # Dashboard overview
│   ├── reviewing-duplicates.md # Approving/rejecting matches
│   ├── merging-records.md      # Merge process explained
│   ├── match-rules.md          # Creating and editing rules
│   ├── scheduled-jobs.md       # Setting up automation
│   └── merge-history.md        # Viewing and undoing merges
│
├── admin-guide/
│   ├── settings.md             # Configuration options
│   ├── billing.md              # Plans and usage
│   ├── white-labeling.md       # Agency branding
│   └── multi-location.md       # Managing multiple locations
│
├── api/
│   ├── overview.md             # API introduction
│   ├── authentication.md       # OAuth and tokens
│   ├── endpoints/
│   │   ├── matches.md
│   │   ├── merges.md
│   │   ├── rules.md
│   │   └── jobs.md
│   ├── webhooks.md             # Webhook events
│   └── rate-limits.md          # API limits
│
├── troubleshooting/
│   ├── common-issues.md        # FAQ
│   ├── error-codes.md          # Error code reference
│   └── contact-support.md      # Getting help
│
└── changelog.md                # Release notes
```

## 11.2 API Documentation (Auto-generated)

```python
# app/main.py

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="MergeMatch API",
    description="""
    MergeMatch API provides data matching and deduplication capabilities
    for GoHighLevel users.

    ## Authentication

    All API requests require authentication via Bearer token.
    Obtain tokens through the OAuth flow or use session tokens from the UI.

    ## Rate Limits

    - 100 requests per 10 seconds per location
    - 200,000 requests per day per location

    ## Error Handling

    All errors follow the format:
    ```json
    {
      "error": {
        "code": "FM-XXXX",
        "message": "Human readable message",
        "details": {},
        "request_id": "uuid"
      }
    }
    ```
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="MergeMatch API",
        version="1.0.0",
        description=app.description,
        routes=app.routes,
    )

    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # Add examples
    # ...

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## 11.3 In-App Help

```tsx
// components/common/HelpTooltip.tsx

interface HelpTooltipProps {
  topic: string;
  children: React.ReactNode;
}

const HELP_CONTENT: Record<string, { title: string; content: string; learnMoreUrl?: string }> = {
  'confidence-score': {
    title: 'Confidence Score',
    content: 'The confidence score (0-100%) indicates how likely two records are duplicates. Higher scores mean stronger matches. Scores above 95% are typically auto-merged.',
    learnMoreUrl: '/docs/understanding-matches#confidence',
  },
  'auto-merge-threshold': {
    title: 'Auto-Merge Threshold',
    content: 'Records with confidence scores above this threshold will be automatically merged without manual review. Set higher (95%+) for conservative merging.',
    learnMoreUrl: '/docs/match-rules#thresholds',
  },
  'master-record': {
    title: 'Master Record',
    content: 'The master record is kept after merging. Data from other records is consolidated into it. Choose based on data completeness or recency.',
    learnMoreUrl: '/docs/merging-records#master-selection',
  },
  'blocking-strategy': {
    title: 'Blocking',
    content: 'Blocking reduces comparisons by grouping records that might match (e.g., same email domain). This makes scanning faster without missing duplicates.',
  },
};

export function HelpTooltip({ topic, children }: HelpTooltipProps) {
  const help = HELP_CONTENT[topic];

  if (!help) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="font-medium mb-1">{help.title}</div>
        <div className="text-sm text-gray-500">{help.content}</div>
        {help.learnMoreUrl && (
          <a href={help.learnMoreUrl} className="text-sm text-blue-500 hover:underline mt-2 block">
            Learn more →
          </a>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Usage
<HelpTooltip topic="confidence-score">
  Confidence Score
</HelpTooltip>
```

## 11.4 Code Style Configuration

### Backend (Python) - Ruff

```toml
# pyproject.toml

[project]
name = "flowmatch-api"
version = "1.0.0"
requires-python = ">=3.11"

[tool.ruff]
target-version = "py311"
line-length = 100
exclude = [
    ".git",
    ".venv",
    "__pycache__",
    "migrations",
]

[tool.ruff.lint]
select = [
    "E",     # pycodestyle errors
    "W",     # pycodestyle warnings
    "F",     # Pyflakes
    "I",     # isort
    "B",     # flake8-bugbear
    "C4",    # flake8-comprehensions
    "UP",    # pyupgrade
    "S",     # flake8-bandit (security)
    "RUF",   # Ruff-specific rules
]
ignore = [
    "E501",  # line too long (handled by formatter)
    "B008",  # function call in default arg (FastAPI Depends)
]

[tool.ruff.lint.isort]
known-first-party = ["app"]

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["S101"]  # Allow assert in tests

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

### Frontend (TypeScript) - ESLint + Prettier

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'jsx-a11y/anchor-is-valid': ['error', { components: ['Link'] }],
  },
};
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        additional_dependencies:
          - eslint@8.56.0
          - '@typescript-eslint/parser@6.21.0'
          - '@typescript-eslint/eslint-plugin@6.21.0'

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=1000']
```

## 11.5 README Template

```markdown
<!-- README.md -->

# MergeMatch

> Data matching and deduplication for GoHighLevel

[![CI](https://github.com/flowmatch/flowmatch/workflows/CI/badge.svg)](https://github.com/flowmatch/flowmatch/actions)
[![Coverage](https://codecov.io/gh/flowmatch/flowmatch/branch/main/graph/badge.svg)](https://codecov.io/gh/flowmatch/flowmatch)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

MergeMatch helps GHL agencies automatically detect and merge duplicate contacts,
companies, and opportunities across locations.

**Key Features:**
- Intelligent duplicate detection with configurable matching rules
- Side-by-side comparison and one-click merge
- Scheduled background scans
- Full audit trail with undo capability
- White-label support for agencies

## Quick Start

### Prerequisites
- Docker & Docker Compose
- GHL Developer Account
- Node.js 20+ (for frontend development)
- Python 3.11+ (for backend development)

### Local Development

```bash
# Clone the repository
git clone https://github.com/flowmatch/flowmatch.git
cd flowmatch

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api alembic upgrade head

# Open the app
open http://localhost:3000
```

### Running Tests

```bash
# Backend tests
docker-compose exec api pytest

# Frontend tests
cd frontend && npm test

# E2E tests
npx playwright test
```

## Project Structure

```
flowmatch/
├── app/                 # Python FastAPI backend
│   ├── api/             # API routes
│   ├── core/            # Config, security, matching engine
│   ├── db/              # Database models & migrations
│   └── services/        # Business logic
├── frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # React hooks
│   │   ├── pages/       # Route pages
│   │   └── services/    # API clients
├── tests/               # Test suites
├── docs/                # Documentation
└── infra/               # Terraform & deployment
```

## Documentation

- [User Guide](docs/user-guide/)
- [API Reference](docs/api/)
- [Development Guide](docs/development/)
- [Architecture](docs/architecture/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.
```

## 11.6 CONTRIBUTING Template

```markdown
<!-- CONTRIBUTING.md -->

# Contributing to MergeMatch

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Docker Desktop
- Node.js 20+
- Python 3.11+
- pnpm (frontend) / pip (backend)

### First-Time Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/flowmatch.git
cd flowmatch

# 2. Install pre-commit hooks
pip install pre-commit
pre-commit install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your GHL sandbox credentials

# 4. Start services
docker-compose up -d

# 5. Install frontend dependencies
cd frontend && pnpm install

# 6. Verify setup
docker-compose exec api pytest tests/unit -v
pnpm test
```

## Development Workflow

### Creating a Branch

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/issue-123-description
```

### Making Changes

1. Write tests first (TDD encouraged)
2. Make your changes
3. Run linters: `ruff check app/` and `pnpm lint`
4. Run tests: `pytest` and `pnpm test`
5. Commit with conventional commit format

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(matching): add phonetic name matching`
- `fix(api): handle expired OAuth tokens gracefully`
- `docs(readme): update installation steps`

### Submitting a Pull Request

1. Push your branch to your fork
2. Open a PR against `main`
3. Fill out the PR template
4. Wait for CI checks to pass
5. Address review feedback

## Code Style

### Python
- Follow PEP 8 (enforced by Ruff)
- Type hints required for all functions
- Docstrings for public APIs

### TypeScript
- Strict mode enabled
- Prefer functional components
- Use React Query for data fetching

## Testing Guidelines

- Unit tests: `tests/unit/` - fast, isolated
- Integration tests: `tests/integration/` - with database
- E2E tests: `tests/e2e/` - full user flows

Minimum coverage: 80% overall, 95% for matching engine

## Getting Help

- Check existing [issues](https://github.com/flowmatch/flowmatch/issues)
- Ask in [Discussions](https://github.com/flowmatch/flowmatch/discussions)
- Reach out on Discord: [invite link]

## Code of Conduct

Be respectful, inclusive, and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
```

## 11.7 Pull Request Template

```markdown
<!-- .github/pull_request_template.md -->

## Summary

<!-- Brief description of what this PR does -->

## Changes

<!-- Bullet points of specific changes -->
-
-
-

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Testing

<!-- How was this tested? -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented hard-to-understand areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Related Issues

<!-- Link to related issues: Fixes #123, Closes #456 -->
```

## 11.8 Issue Templates

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug or unexpected behavior
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting! Please fill out the details below.

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: What happened?
      placeholder: A clear description of the bug
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: How can we reproduce this?
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should have happened?
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - Low (cosmetic issue)
        - Medium (feature works but with issues)
        - High (feature broken)
        - Critical (data loss or security)
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: MergeMatch Version
      placeholder: e.g., 1.2.3
```

```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: Feature Request
description: Suggest a new feature or improvement
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this solve?
      placeholder: I'm frustrated when...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How should it work?
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: What other solutions did you consider?

  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - Nice to have
        - Important
        - Critical for my use case
```

---

# 12. RELEASE STRATEGY

## 12.1 Feature Flags

```python
# app/core/feature_flags.py

from typing import Optional
import posthog  # or LaunchDarkly, Split.io, etc.

class FeatureFlags:
    """Feature flag management"""

    FLAGS = {
        "auto_merge_enabled": {
            "default": False,
            "description": "Enable automatic merging for high-confidence matches",
            "rollout_percent": 0,
        },
        "custom_objects_matching": {
            "default": False,
            "description": "Enable matching for GHL custom objects",
            "rollout_percent": 0,
        },
        "ml_matching": {
            "default": False,
            "description": "Use ML model for matching instead of rule-based",
            "rollout_percent": 0,
        },
        "new_merge_ui": {
            "default": False,
            "description": "New merge preview UI design",
            "rollout_percent": 0,
        },
    }

    def __init__(self):
        posthog.api_key = settings.POSTHOG_API_KEY

    def is_enabled(
        self,
        flag_name: str,
        tenant_id: Optional[str] = None,
        default: bool = None
    ) -> bool:
        """Check if feature flag is enabled for tenant"""

        flag_config = self.FLAGS.get(flag_name)
        if not flag_config:
            return default if default is not None else False

        # Check PostHog for dynamic evaluation
        if tenant_id:
            return posthog.feature_enabled(
                flag_name,
                tenant_id,
                default=flag_config["default"]
            )

        return flag_config["default"]

    def get_all_flags(self, tenant_id: str) -> dict:
        """Get all flag values for a tenant"""
        return {
            name: self.is_enabled(name, tenant_id)
            for name in self.FLAGS
        }

# Usage
feature_flags = FeatureFlags()

@router.post("/merges")
async def create_merge(request: MergeRequest, tenant: Tenant = Depends()):
    if request.auto_merge and not feature_flags.is_enabled("auto_merge_enabled", tenant.id):
        raise MergeMatchError(
            ErrorCode.FEATURE_NOT_AVAILABLE,
            details={"feature": "auto_merge"}
        )
    # ...
```

## 12.2 Gradual Rollout

```yaml
# .github/workflows/gradual-rollout.yml

name: Gradual Production Rollout

on:
  workflow_dispatch:
    inputs:
      target_percent:
        description: 'Target rollout percentage (0-100)'
        required: true
        default: '10'
      feature:
        description: 'Feature to rollout'
        required: true
        type: choice
        options:
          - full_release
          - auto_merge_enabled
          - custom_objects_matching

jobs:
  rollout:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Update feature flag
        if: inputs.feature != 'full_release'
        run: |
          curl -X PATCH "https://app.posthog.com/api/projects/${{ secrets.POSTHOG_PROJECT_ID }}/feature_flags/${{ inputs.feature }}" \
            -H "Authorization: Bearer ${{ secrets.POSTHOG_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"rollout_percentage": ${{ inputs.target_percent }}}'

      - name: Update ECS service (weighted routing)
        if: inputs.feature == 'full_release'
        run: |
          # Update ALB target group weights for blue/green
          aws elbv2 modify-rule \
            --rule-arn ${{ secrets.ALB_RULE_ARN }} \
            --actions '[
              {
                "Type": "forward",
                "ForwardConfig": {
                  "TargetGroups": [
                    {"TargetGroupArn": "${{ secrets.TG_BLUE_ARN }}", "Weight": ${{ 100 - inputs.target_percent }}},
                    {"TargetGroupArn": "${{ secrets.TG_GREEN_ARN }}", "Weight": ${{ inputs.target_percent }}}
                  ]
                }
              }
            ]'

      - name: Monitor error rate
        run: |
          # Wait and check error rate
          sleep 300  # 5 minutes

          ERROR_RATE=$(aws cloudwatch get-metric-statistics \
            --namespace MergeMatch \
            --metric-name ErrorRate \
            --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
            --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
            --period 300 \
            --statistics Average \
            --query 'Datapoints[0].Average' \
            --output text)

          if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
            echo "Error rate too high ($ERROR_RATE), triggering rollback"
            exit 1
          fi

      - name: Notify on success
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -d '{"text": "Rollout to ${{ inputs.target_percent }}% complete for ${{ inputs.feature }}"}'

  rollback:
    needs: rollout
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Rollback feature flag
        run: |
          curl -X PATCH "https://app.posthog.com/api/projects/${{ secrets.POSTHOG_PROJECT_ID }}/feature_flags/${{ inputs.feature }}" \
            -H "Authorization: Bearer ${{ secrets.POSTHOG_API_KEY }}" \
            -d '{"rollout_percentage": 0}'

      - name: Rollback ECS
        run: |
          aws elbv2 modify-rule \
            --rule-arn ${{ secrets.ALB_RULE_ARN }} \
            --actions '[
              {
                "Type": "forward",
                "ForwardConfig": {
                  "TargetGroups": [
                    {"TargetGroupArn": "${{ secrets.TG_BLUE_ARN }}", "Weight": 100},
                    {"TargetGroupArn": "${{ secrets.TG_GREEN_ARN }}", "Weight": 0}
                  ]
                }
              }
            ]'

      - name: Alert on rollback
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -d '{"text": "⚠️ ROLLBACK triggered for ${{ inputs.feature }} due to high error rate"}'
```

## 12.3 Hotfix Process

```markdown
# Hotfix Process

## When to Use
- Critical bug affecting >10% of users
- Security vulnerability
- Data corruption issue

## Steps

### 1. Create Hotfix Branch
```bash
git checkout main
git pull origin main
git checkout -b hotfix/FM-XXX-description
```

### 2. Implement Fix
- Minimal changes only
- Include test case that reproduces the bug
- No refactoring or unrelated changes

### 3. Fast-Track Review
- Tag PR with `hotfix` label
- Requires 1 senior engineer approval (vs normal 2)
- Skip staging if critical (document justification)

### 4. Deploy
```bash
# Direct to production
gh workflow run deploy.yml -f environment=production -f hotfix=true
```

### 5. Monitor
- Watch error rates for 30 minutes
- Verify fix in production
- Update status page if applicable

### 6. Backport
```bash
# Merge to develop branch
git checkout develop
git merge hotfix/FM-XXX-description
```

### 7. Post-Mortem
- Document root cause
- Add regression test
- Update runbooks if needed
```

## 12.4 Beta Testing Program

```python
# app/core/beta.py

class BetaProgram:
    """Manage beta testing program"""

    async def enroll_tenant(self, tenant_id: str, program: str):
        """Enroll tenant in beta program"""
        await self.db.execute("""
            INSERT INTO beta_enrollments (tenant_id, program, enrolled_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (tenant_id, program) DO NOTHING
        """, tenant_id, program)

        # Enable feature flags for beta
        await self.feature_flags.enable_for_tenant(
            tenant_id,
            self.BETA_FLAGS[program]
        )

    async def get_beta_tenants(self, program: str) -> list:
        """Get all tenants enrolled in a beta program"""
        return await self.db.fetch("""
            SELECT t.* FROM tenants t
            JOIN beta_enrollments be ON t.id = be.tenant_id
            WHERE be.program = $1 AND be.status = 'active'
        """, program)

    async def collect_feedback(
        self,
        tenant_id: str,
        program: str,
        rating: int,
        feedback: str
    ):
        """Collect feedback from beta tester"""
        await self.db.execute("""
            INSERT INTO beta_feedback (tenant_id, program, rating, feedback, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        """, tenant_id, program, rating, feedback)

    BETA_FLAGS = {
        "v2_matching": ["ml_matching", "improved_blocking"],
        "new_ui": ["new_merge_ui", "new_dashboard"],
        "enterprise_features": ["custom_objects_matching", "api_access"],
    }
```

---

# 13. ARCHITECTURE DECISION RECORDS (ADRs)

Lightweight documentation of key architectural decisions and their rationale.

## ADR-001: FastAPI over Django/Flask

**Status:** Accepted
**Date:** 2024-12

**Context:**
We need a Python web framework for the MergeMatch API. Options: Django, Flask, FastAPI. Key requirements: async support for GHL API calls, auto-generated OpenAPI docs, type safety.

**Decision:**
Use FastAPI.

**Rationale:**
- **Async-first:** Native async/await for concurrent GHL API requests without blocking
- **Auto-generated OpenAPI:** Pydantic models → OpenAPI spec automatically
- **Type hints enforced:** Catches errors at development time, IDE autocomplete
- **Performance:** Built on Starlette/uvicorn, benchmarks faster than Django REST

**Consequences:**
- Smaller ecosystem than Django (fewer batteries included)
- Team needs familiarity with async patterns
- SQLAlchemy async integration required (vs Django ORM)

---

## ADR-002: PostgreSQL with Row-Level Security for Multi-Tenancy

**Status:** Accepted
**Date:** 2024-12

**Context:**
MergeMatch serves multiple GHL agencies (tenants). Options: separate databases per tenant, schema per tenant, or shared database with tenant column + RLS.

**Decision:**
Single shared database with Row-Level Security (RLS) policies.

**Rationale:**
- **Simplicity:** One database to manage, migrate, back up
- **Cost:** No per-tenant database overhead
- **RLS guarantees:** Postgres enforces isolation at database level—even if app code has bugs, tenants can't see each other's data
- **Scalability:** Works for 1,000+ tenants; vertical scaling sufficient initially

**Consequences:**
- Must set `app.current_tenant_id` session variable on every request
- Complex queries need careful testing for RLS behavior
- Tenant migration to dedicated database harder if ever needed

---

## ADR-003: Monolith-First Architecture

**Status:** Accepted
**Date:** 2024-12

**Context:**
Starting a new product—should we build microservices from day one for scalability, or a monolith for speed?

**Decision:**
Start with a modular monolith. Extract services later if needed.

**Rationale:**
- **Speed to market:** Single deployable, simpler debugging, faster iteration
- **Premature optimization:** We don't know our scaling bottlenecks yet
- **Team size:** Small team—microservices add coordination overhead
- **Modular design:** Code structured in modules (matching, merging, jobs) for future extraction

**Consequences:**
- All components scale together (may over-provision some)
- Must maintain clean module boundaries to enable future extraction
- Single point of failure (mitigated by container orchestration)

---

## ADR-004: Redis for Caching and Job Queues

**Status:** Accepted
**Date:** 2024-12

**Context:**
Need caching layer for GHL API responses and a job queue for background scans. Options: Redis, Memcached, RabbitMQ, SQS.

**Decision:**
Redis for both caching and job queues (via Celery).

**Rationale:**
- **Single dependency:** One system for caching + queuing reduces ops complexity
- **Celery compatibility:** Well-tested Redis broker for Celery tasks
- **Data structures:** Redis sorted sets useful for rate limiting, priority queues
- **Persistence:** Redis can persist (AOF/RDB) for queue durability

**Cache Invalidation Strategy:**
```python
# Invalidation patterns
CACHE_KEYS = {
    "contacts:{location_id}": timedelta(minutes=5),    # Short TTL, frequent updates
    "match_rules:{tenant_id}": timedelta(hours=1),     # Rarely changes
    "session:{session_id}": timedelta(hours=24),       # Token lifetime
}

# Write-through invalidation
async def update_contact(contact_id: str, data: dict):
    result = await ghl_client.update(contact_id, data)
    await cache.delete(f"contacts:{result['locationId']}")  # Invalidate list
    await cache.delete(f"contact:{contact_id}")            # Invalidate item
    return result
```

**Consequences:**
- Redis single point of failure (mitigated by ElastiCache Multi-AZ)
- Memory limits constrain cache size
- Need monitoring for cache hit rates

---

## ADR-005: API Versioning Strategy

**Status:** Accepted
**Date:** 2024-12

**Context:**
How to version the MergeMatch API to allow evolution without breaking existing integrations.

**Decision:**
URL path versioning (`/v1/`, `/v2/`) with deprecation policy.

**Rationale:**
- **Explicit:** Version visible in every request, clear which version client uses
- **Routing:** Easy to route in load balancer or API gateway
- **Industry standard:** Most SaaS APIs use URL versioning (Stripe, Twilio, GHL itself)

**Versioning Policy:**
```
┌─────────────────────────────────────────────────────────┐
│                API VERSIONING POLICY                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Version Lifecycle:                                     │
│  ┌────────┐   ┌──────────┐   ┌────────────┐            │
│  │ Active │ → │ Deprecated│ → │ Sunset     │            │
│  │ (v2)   │   │ (v1)      │   │ (removed)  │            │
│  └────────┘   └──────────┘   └────────────┘            │
│                                                         │
│  Timeline:                                              │
│  • New version: 6-month overlap with previous           │
│  • Deprecation warning: 6 months before sunset          │
│  • Sunset: Hard removal after deprecation period        │
│                                                         │
│  Breaking Changes (require new version):                │
│  • Removing endpoints                                   │
│  • Removing required fields                             │
│  • Changing field types                                 │
│  • Changing authentication                              │
│                                                         │
│  Non-Breaking Changes (same version):                   │
│  • Adding endpoints                                     │
│  • Adding optional fields                               │
│  • Adding enum values                                   │
│  • Performance improvements                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Deprecation Headers:**
```python
# app/middleware/versioning.py
async def add_deprecation_headers(request, call_next):
    response = await call_next(request)

    if request.url.path.startswith("/v1"):
        response.headers["Deprecation"] = "true"
        response.headers["Sunset"] = "2025-06-01T00:00:00Z"
        response.headers["Link"] = '</v2>; rel="successor-version"'

    return response
```

**Consequences:**
- Need to maintain multiple versions during overlap
- Documentation must cover all active versions
- Client SDKs need version parameter

---

# APPENDIX: CHECKLIST FOR DEVELOPMENT READINESS

## Pre-Development Checklist

- [ ] **API Specification**: OpenAPI spec reviewed and approved
- [ ] **Database Schema**: Migrations tested in staging
- [ ] **Security Review**: Threat model documented
- [ ] **Test Strategy**: Coverage targets defined
- [ ] **Infrastructure**: Terraform plans reviewed
- [ ] **Monitoring**: Dashboards and alerts configured
- [ ] **Documentation**: User guide outline approved

## Sprint 0 Checklist

- [ ] Development environment setup documented
- [ ] CI/CD pipeline operational
- [ ] GHL sandbox credentials obtained
- [ ] OAuth flow tested end-to-end
- [ ] Database connections verified
- [ ] Logging and tracing operational

## MVP Launch Checklist

- [ ] All P0 features complete
- [ ] 80% test coverage achieved
- [ ] Security penetration test passed
- [ ] Load test completed (target: 100 concurrent users)
- [ ] GHL Marketplace submission approved
- [ ] Billing integration tested
- [ ] Documentation published
- [ ] Support runbooks created
- [ ] Monitoring dashboards reviewed
- [ ] Rollback procedure tested

