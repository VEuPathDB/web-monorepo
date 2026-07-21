# Upload-path external reference (PMID / DOI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user optionally record the PubMed ID or DOI of an uploaded PDF on the AI-assisted comment upload tab, store it as inert provenance, and display it on both the comment-show page and the gene-page comments table.

**Architecture:** Two new store-and-display columns (`external_ref`, `external_ref_kind`) already exist on `usercomments.comment_ai_run`. We thread them through the existing source-provenance plumbing exactly like the established `external_url` / `external_title` fields: request DTO → `JobSubmission` → `buildRun` → `CommentAiRun` row → read back onto a published comment's `aiProvenance`. The FE adds one optional text field with client-side kind auto-detection (PMID vs DOI are structurally disjoint, so detection is reliable). The values never enter the `job_id` digest or any dedup/already-published lookup.

**Tech Stack:** Java (JAX-RS, JUnit 4) in `ApiCommonWebsite`; WDK model XML in `ApiCommonModel`; TypeScript/React in `genomics-site`.

## Global Constraints

- **`external_ref` / `external_ref_kind` are NEVER added to the `job_id` digest** (`JobDigest.compute` call site in `SyncPrelude.computeJobId`) nor to any already-published / cache `WHERE` clause. They are inert provenance. (From spec §"Core principle".)
- **`external_ref_kind` ∈ `{'pubmed', 'doi'}` or NULL.** Both fields are upload-path only; null them on the pubmed path.
- **PMID/DOI detection + validation regexes (identical FE and BE):** `pubmed` ⇒ value matches `^\d{1,9}$` after stripping a leading `PMID:` (case-insensitive) and whitespace. `doi` ⇒ value matches `^10\.\d{4,9}/\S+$` after stripping a leading `https?://(dx\.)?doi\.org/` (case-insensitive) and whitespace.
- **DOIs never enter the gene-page `pmids` aggregate** — only `external_ref_kind='pubmed'` does.
- **AI source PMIDs render through `aiProvenance`, never `pubMedRefs`** (preserves the `bd0fb09e0e` no-duplicate contract). No change to `CommentReferences.tsx`.
- **Java build order:** after changing `ApiCommonWebsite/Model`, run `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Model && mvn install -DskipTests` before building/testing `Service` (Service resolves Model from `.m2`).
- **genomics-site has no unit-test runner** (no jest). FE verification is `yarn nx compile:check @veupathdb/genomics-site` plus documented manual browser checks. Pure FE logic is written as exported functions with documented input/output cases.
- **Import style:** regular imports, not `import type`.
- **DB migration scripting is out of scope** — the two columns already exist in `userdb_devn`; the user reconciles migration scripts separately at beta deployment.
- **Commit message footer:** end every commit message with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

Paths are relative to:

- Java: `/home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/`
- WDK model: `/home/maccallr/work/ai-wdk/project_home/ApiCommonModel/`
- FE: `/home/maccallr/Desktop/EDA/web-monorepo/packages/sites/genomics-site/webapp/wdkCustomization/js/client/`

---

### Task 1: `ExternalRef` pure helper (detect / normalise / validate) — Java

**Files:**

- Create: `Service/src/main/java/org/apidb/apicommon/service/services/ai/ExternalRef.java`
- Test: `Service/src/test/java/org/apidb/apicommon/service/services/ai/ExternalRefTest.java`

**Interfaces:**

- Consumes: nothing.
- Produces: `ExternalRef.normalise(String rawRef, String rawKind) -> ExternalRef.Result`. `Result` has public final `String ref` (normalised, or `null`) and `String kind` (`"pubmed"` | `"doi"` | `null`). Throws `javax.ws.rs.BadRequestException` on malformed input. Constants `ExternalRef.KIND_PUBMED = "pubmed"`, `ExternalRef.KIND_DOI = "doi"`.

- [ ] **Step 1: Write the failing tests**

Create `ExternalRefTest.java`:

```java
package org.apidb.apicommon.service.services.ai;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import javax.ws.rs.BadRequestException;

import org.junit.Test;

public class ExternalRefTest {

  @Test
  public void bothBlank_yieldsNullNull() {
    ExternalRef.Result r = ExternalRef.normalise(null, null);
    assertNull(r.ref);
    assertNull(r.kind);
  }

  @Test
  public void blankRef_ignoresKind() {
    ExternalRef.Result r = ExternalRef.normalise("   ", "pubmed");
    assertNull(r.ref);
    assertNull(r.kind);
  }

  @Test
  public void pubmed_plainDigits() {
    ExternalRef.Result r = ExternalRef.normalise("12345678", "pubmed");
    assertEquals("12345678", r.ref);
    assertEquals("pubmed", r.kind);
  }

  @Test
  public void pubmed_stripsPrefixAndWhitespace() {
    ExternalRef.Result r = ExternalRef.normalise("  PMID: 12345678 ", "pubmed");
    assertEquals("12345678", r.ref);
    assertEquals("pubmed", r.kind);
  }

  @Test(expected = BadRequestException.class)
  public void pubmed_rejectsNonDigits() {
    ExternalRef.normalise("abc123", "pubmed");
  }

  @Test
  public void doi_plain() {
    ExternalRef.Result r = ExternalRef.normalise("10.1234/abc.def", "doi");
    assertEquals("10.1234/abc.def", r.ref);
    assertEquals("doi", r.kind);
  }

  @Test
  public void doi_stripsUrlPrefix() {
    ExternalRef.Result r = ExternalRef.normalise("https://doi.org/10.1234/abc.def", "doi");
    assertEquals("10.1234/abc.def", r.ref);
    assertEquals("doi", r.kind);
  }

  @Test(expected = BadRequestException.class)
  public void doi_rejectsNonDoi() {
    ExternalRef.normalise("not-a-doi", "doi");
  }

  @Test(expected = BadRequestException.class)
  public void refPresent_rejectsMissingKind() {
    ExternalRef.normalise("12345678", null);
  }

  @Test(expected = BadRequestException.class)
  public void refPresent_rejectsUnknownKind() {
    ExternalRef.normalise("12345678", "isbn");
  }

  @Test(expected = BadRequestException.class)
  public void kindMismatch_pubmedKindWithDoiValue() {
    ExternalRef.normalise("10.1234/abc", "pubmed");
  }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Service && mvn -Dtest=ExternalRefTest test`
Expected: FAIL — compilation error, `ExternalRef` does not exist.

- [ ] **Step 3: Write the implementation**

Create `ExternalRef.java`:

```java
package org.apidb.apicommon.service.services.ai;

import java.util.regex.Pattern;

import javax.ws.rs.BadRequestException;

/**
 * Normalises and validates the optional upload-path external reference
 * (a PubMed id or a DOI). Store-and-display only: never enters the job_id
 * digest or any dedup lookup. PMID and DOI formats are structurally disjoint,
 * so the same rules drive both the FE auto-detection and this server-side check.
 */
public final class ExternalRef {

  public static final String KIND_PUBMED = "pubmed";
  public static final String KIND_DOI = "doi";

  private static final Pattern PMID = Pattern.compile("^\\d{1,9}$");
  private static final Pattern DOI = Pattern.compile("^10\\.\\d{4,9}/\\S+$");
  private static final Pattern PMID_PREFIX =
      Pattern.compile("^PMID:\\s*", Pattern.CASE_INSENSITIVE);
  private static final Pattern DOI_URL_PREFIX =
      Pattern.compile("^https?://(dx\\.)?doi\\.org/", Pattern.CASE_INSENSITIVE);

  /** Normalised (ref, kind); either both set or both null. */
  public static final class Result {
    public final String ref;
    public final String kind;

    Result(String ref, String kind) {
      this.ref = ref;
      this.kind = kind;
    }
  }

  private ExternalRef() {}

  public static Result normalise(String rawRef, String rawKind) {
    if (rawRef == null || rawRef.trim().isEmpty()) {
      return new Result(null, null); // blank ref → no provenance, kind ignored
    }
    String kind = rawKind == null ? "" : rawKind.trim();
    String ref = rawRef.trim();

    switch (kind) {
      case KIND_PUBMED: {
        String stripped = PMID_PREFIX.matcher(ref).replaceFirst("").trim();
        if (!PMID.matcher(stripped).matches())
          throw new BadRequestException(
              "external_ref is not a valid PubMed id: " + rawRef);
        return new Result(stripped, KIND_PUBMED);
      }
      case KIND_DOI: {
        String stripped = DOI_URL_PREFIX.matcher(ref).replaceFirst("").trim();
        if (!DOI.matcher(stripped).matches())
          throw new BadRequestException(
              "external_ref is not a valid DOI: " + rawRef);
        return new Result(stripped, KIND_DOI);
      }
      default:
        throw new BadRequestException(
            "external_ref_kind must be 'pubmed' or 'doi' when external_ref is present");
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Service && mvn -Dtest=ExternalRefTest test`
Expected: PASS — 11 tests run, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite
git add Service/src/main/java/org/apidb/apicommon/service/services/ai/ExternalRef.java \
        Service/src/test/java/org/apidb/apicommon/service/services/ai/ExternalRefTest.java
git commit -m "feat(ai-comments): ExternalRef normalise/validate helper (PMID/DOI)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Carry `external_ref` through request DTO → validate → `JobSubmission` — Java

**Files:**

- Modify: `Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationRequest.java`
- Modify: `Service/src/main/java/org/apidb/apicommon/service/services/ai/SyncPrelude.java` (the `validate` method)
- Modify: `Service/src/main/java/org/apidb/apicommon/service/services/ai/JobSubmission.java`
- Test: `Service/src/test/java/org/apidb/apicommon/service/services/ai/SyncPreludeTest.java`

**Interfaces:**

- Consumes: `ExternalRef.normalise(...)` (Task 1).
- Produces: `AiGenePublicationRequest.externalRef` / `.externalRefKind` (public, `@JsonProperty("external_ref")` / `("external_ref_kind")`); `JobSubmission.getExternalRef()` / `.getExternalRefKind()`. After `SyncPrelude.validate(request)` the request's `externalRef`/`externalRefKind` are normalised in place (or both null), and null on the pubmed path.

- [ ] **Step 1: Add the request DTO fields**

In `AiGenePublicationRequest.java`, after the `externalTitle` field (the `@JsonProperty("external_title")` block), add:

```java
  /** optional upload provenance — a PubMed id or DOI the user asserts for the PDF. */
  @JsonProperty("external_ref")
  public String externalRef;

  /** {@code pubmed} | {@code doi} — kind of {@link #externalRef}; upload path only. */
  @JsonProperty("external_ref_kind")
  public String externalRefKind;
```

- [ ] **Step 2: Add `JobSubmission` fields, constructor copies, and getters**

In `JobSubmission.java`, add two private final fields after `_externalTitle`:

```java
  private final String _externalRef;           // optional upload provenance (PMID/DOI)
  private final String _externalRefKind;       // 'pubmed' | 'doi' | null
```

In the constructor, after `_externalTitle = request.externalTitle;`, add:

```java
    _externalRef = request.externalRef;
    _externalRefKind = request.externalRefKind;
```

After the `getExternalTitle()` getter, add:

```java
  public String getExternalRef() { return _externalRef; }
  public String getExternalRefKind() { return _externalRefKind; }
```

- [ ] **Step 3: Write the failing tests**

In `SyncPreludeTest.java`, add these test methods (the existing `uploadRequest()` / `pubmedRequest()` helpers are reused):

```java
  @Test
  public void validate_normalisesUploadPubmedRef() {
    AiGenePublicationRequest r = uploadRequest();
    r.externalRef = "  PMID: 12345678 ";
    r.externalRefKind = "pubmed";
    SyncPrelude.validate(r);
    org.junit.Assert.assertEquals("12345678", r.externalRef);
    org.junit.Assert.assertEquals("pubmed", r.externalRefKind);
  }

  @Test
  public void validate_normalisesUploadDoiRef() {
    AiGenePublicationRequest r = uploadRequest();
    r.externalRef = "https://doi.org/10.1234/abc.def";
    r.externalRefKind = "doi";
    SyncPrelude.validate(r);
    org.junit.Assert.assertEquals("10.1234/abc.def", r.externalRef);
    org.junit.Assert.assertEquals("doi", r.externalRefKind);
  }

  @Test(expected = javax.ws.rs.BadRequestException.class)
  public void validate_rejectsMalformedExternalRef() {
    AiGenePublicationRequest r = uploadRequest();
    r.externalRef = "not-a-pmid";
    r.externalRefKind = "pubmed";
    SyncPrelude.validate(r);
  }

  @Test
  public void validate_clearsExternalRefOnPubmedPath() {
    AiGenePublicationRequest r = pubmedRequest();
    r.externalRef = "12345678";
    r.externalRefKind = "pubmed";
    SyncPrelude.validate(r);
    org.junit.Assert.assertNull(r.externalRef);
    org.junit.Assert.assertNull(r.externalRefKind);
  }

  @Test
  public void validate_acceptsUploadWithNoExternalRef() {
    AiGenePublicationRequest r = uploadRequest(); // no external_ref set
    SyncPrelude.validate(r);
    org.junit.Assert.assertNull(r.externalRef);
    org.junit.Assert.assertNull(r.externalRefKind);
  }
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Service && mvn -Dtest=SyncPreludeTest test`
Expected: FAIL — the new assertions fail (validate does not yet normalise `externalRef`).

- [ ] **Step 5: Wire normalisation into `validate`**

In `SyncPrelude.java`, modify the `validate` method's `switch (type)` block. Replace the `case "upload":` and `case "pubmed":` bodies so each ends by setting the normalised values:

```java
    switch (type) {
      case "pubmed":
        if (isBlank(request.pubmedId))
          throw new BadRequestException("pubmed_id is required when document_type=pubmed");
        // external_ref is an upload-only field; never carry it on the pubmed path.
        request.externalRef = null;
        request.externalRefKind = null;
        break;
      case "upload":
        if (isBlank(request.paperText))
          throw new BadRequestException("paper_text is required when document_type=upload");
        if (request.pdfContentSha256 == null
            || !SHA256_HEX.matcher(request.pdfContentSha256).matches())
          throw new BadRequestException(
              "pdf_content_sha256 must be a 64-character hex string when document_type=upload");
        ExternalRef.Result ref = ExternalRef.normalise(request.externalRef, request.externalRefKind);
        request.externalRef = ref.ref;
        request.externalRefKind = ref.kind;
        break;
      default:
        throw new BadRequestException("document_type must be 'pubmed' or 'upload'");
    }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Service && mvn -Dtest=SyncPreludeTest,ExternalRefTest test`
Expected: PASS — all SyncPrelude + ExternalRef tests pass.

- [ ] **Step 7: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite
git add Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationRequest.java \
        Service/src/main/java/org/apidb/apicommon/service/services/ai/SyncPrelude.java \
        Service/src/main/java/org/apidb/apicommon/service/services/ai/JobSubmission.java \
        Service/src/test/java/org/apidb/apicommon/service/services/ai/SyncPreludeTest.java
git commit -m "feat(ai-comments): validate+carry external_ref through JobSubmission

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Persist + read `external_ref` columns — Java Model module

**Files:**

- Modify: `Model/src/main/java/org/apidb/apicommon/model/comment/pojo/CommentAiRun.java`
- Modify: `Model/src/main/java/org/apidb/apicommon/model/comment/repo/InsertCommentAiRunQuery.java`
- Modify: `Model/src/main/java/org/apidb/apicommon/model/comment/repo/GetCommentAiRunQuery.java`
- Modify: `Model/src/main/java/org/apidb/apicommon/model/comment/pojo/AiProvenanceView.java`
- Modify: `Model/src/main/java/org/apidb/apicommon/model/comment/repo/GetCommentAiProvenanceQuery.java`

**Interfaces:**

- Consumes: nothing (pure Model-module changes).
- Produces: `CommentAiRun.getExternalRef()/.setExternalRef(String)`, `.getExternalRefKind()/.setExternalRefKind(String)`. `AiProvenanceView.Source.upload(externalUrl, externalTitle, pdfContentSha256, externalRef, externalRefKind)` (new 5-arg signature) with `getExternalRef()/getExternalRefKind()`.

- [ ] **Step 1: Add fields + getters/setters to `CommentAiRun`**

In `CommentAiRun.java`, after the `_externalTitle` field declaration add:

```java
  private String _externalRef;           // iff sourceKind == 'upload', optional (PMID/DOI)
  private String _externalRefKind;       // 'pubmed' | 'doi' | null
```

After the `setExternalTitle(...)` getter/setter pair add:

```java
  public String getExternalRef() { return _externalRef; }
  public CommentAiRun setExternalRef(String externalRef) { _externalRef = externalRef; return this; }

  public String getExternalRefKind() { return _externalRefKind; }
  public CommentAiRun setExternalRefKind(String externalRefKind) { _externalRefKind = externalRefKind; return this; }
```

- [ ] **Step 2: Bind the two columns in `InsertCommentAiRunQuery`**

In `InsertCommentAiRunQuery.java`, update `SQL` to add the two columns and two value placeholders (now 18). Replace the `SQL` constant:

```java
  private static final String SQL = "INSERT INTO %s." + Table.COMMENT_AI_RUN + " (" +
      "job_id, model_name, prompt_version, source_kind, pubmed_id, " +
      "external_url, external_title, pdf_content_sha256, gene_id, synonyms_used, " +
      "options_json, terminal_status, is_only_mentioned_in_passing, " +
      "ai_headline, ai_content, completed_at, external_ref, external_ref_kind" +
      ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
```

Add two `VARCHAR` entries to the end of `TYPES` (after `completed_at`'s `TIMESTAMP`):

```java
      TIMESTAMP,  // completed_at
      VARCHAR,    // external_ref
      VARCHAR     // external_ref_kind
  };
```

In `getArguments()`, append the two values to the `batch.add(new Object[] { ... })` array, after `completedAt`:

```java
        _run.getAiContent(), completedAt,
        _run.getExternalRef(), _run.getExternalRefKind()
    });
```

- [ ] **Step 3: Select + parse the two columns in `GetCommentAiRunQuery`**

In `GetCommentAiRunQuery.java`, update `SQL` to select the two columns:

```java
  private static final String SQL = "SELECT" +
      " job_id, model_name, prompt_version, source_kind, pubmed_id," +
      " external_url, external_title, pdf_content_sha256, gene_id, synonyms_used," +
      " options_json, terminal_status, is_only_mentioned_in_passing," +
      " ai_headline, ai_content, completed_at, external_ref, external_ref_kind" +
      " FROM %s." + Table.COMMENT_AI_RUN +
      " WHERE job_id = ?";
```

In `parseResults`, add the two setters after `.setCompletedAt(...)`:

```java
        .setCompletedAt(rs.getTimestamp("completed_at"))
        .setExternalRef(rs.getString("external_ref"))
        .setExternalRefKind(rs.getString("external_ref_kind"));
```

(Move the `;` from the old last setter onto `.setExternalRefKind(...)`.)

- [ ] **Step 4: Extend `AiProvenanceView.Source` to carry the two fields**

In `AiProvenanceView.java`, add two fields to the `Source` class after `_pdfContentSha256`:

```java
    private final String _externalRef;
    private final String _externalRefKind;
```

Update the private constructor signature and body to take and assign them:

```java
    private Source(String kind, String pubmedId, String externalUrl,
        String externalTitle, String pdfContentSha256,
        String externalRef, String externalRefKind) {
      _kind = kind;
      _pubmedId = pubmedId;
      _externalUrl = externalUrl;
      _externalTitle = externalTitle;
      _pdfContentSha256 = pdfContentSha256;
      _externalRef = externalRef;
      _externalRefKind = externalRefKind;
    }
```

Update both factories — `pubmed(...)` passes nulls for the two new args; `upload(...)` gains them:

```java
    /** A PubMed-sourced run, identified by its PMID alone. */
    public static Source pubmed(String pubmedId) {
      return new Source("pubmed", pubmedId, null, null, null, null, null);
    }

    /** An upload-sourced run; url/title and an asserted PMID/DOI ref all optional. */
    public static Source upload(String externalUrl, String externalTitle,
        String pdfContentSha256, String externalRef, String externalRefKind) {
      return new Source("upload", null, externalUrl, externalTitle, pdfContentSha256,
          externalRef, externalRefKind);
    }
```

Add the two getters after `getPdfContentSha256()`:

```java
    public String getExternalRef() { return _externalRef; }
    public String getExternalRefKind() { return _externalRefKind; }
```

(`@JsonInclude(NON_NULL)` on `Source` means these serialise only when present — pubmed sources and ref-less uploads omit them.)

- [ ] **Step 5: Read the two columns in `GetCommentAiProvenanceQuery`**

In `GetCommentAiProvenanceQuery.java`, add the two columns to the `getQuery()` SELECT (the `r.` run-row columns):

```java
        " r.source_kind, r.pubmed_id, r.external_url, r.external_title, r.pdf_content_sha256," +
        " r.external_ref, r.external_ref_kind," +
        " r.ai_headline, r.ai_content" +
```

In `parseResults`, update the `upload(...)` call to pass the two new values:

```java
      AiProvenanceView.Source source = "pubmed".equals(rs.getString("source_kind"))
          ? AiProvenanceView.Source.pubmed(rs.getString("pubmed_id"))
          : AiProvenanceView.Source.upload(
              rs.getString("external_url"),
              rs.getString("external_title"),
              rs.getString("pdf_content_sha256"),
              rs.getString("external_ref"),
              rs.getString("external_ref_kind"));
```

- [ ] **Step 6: Build the Model module to verify it compiles + install to `.m2`**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Model && mvn clean install -DskipTests`
Expected: `BUILD SUCCESS`. (No unit test: these are plain getters/setters + SQL strings; the SQL binding is verified live at dev-server deploy, consistent with the existing D6/D7 approach in `CLAUDE-ai-user-comments.md`.)

- [ ] **Step 7: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite
git add Model/src/main/java/org/apidb/apicommon/model/comment/pojo/CommentAiRun.java \
        Model/src/main/java/org/apidb/apicommon/model/comment/repo/InsertCommentAiRunQuery.java \
        Model/src/main/java/org/apidb/apicommon/model/comment/repo/GetCommentAiRunQuery.java \
        Model/src/main/java/org/apidb/apicommon/model/comment/pojo/AiProvenanceView.java \
        Model/src/main/java/org/apidb/apicommon/model/comment/repo/GetCommentAiProvenanceQuery.java
git commit -m "feat(ai-comments): persist + read external_ref on comment_ai_run

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Map `external_ref` onto the run row + source JSON — Java Service module

**Files:**

- Modify: `Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationPipeline.java` (the `buildRun` method)
- Modify: `Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationCommentService.java` (the `sourceJson` methods)

**Interfaces:**

- Consumes: `JobSubmission.getExternalRef()/.getExternalRefKind()` (Task 2); `CommentAiRun.setExternalRef(...)/.setExternalRefKind(...)`, `CommentAiRun.getExternalRef()/.getExternalRefKind()` (Task 3).
- Produces: `comment_ai_run` rows carry `external_ref`/`external_ref_kind`; the `source` JSON object emits `external_ref`/`external_ref_kind` for upload rows.

- [ ] **Step 1: Map the fields in `buildRun`**

In `AiGenePublicationPipeline.java`, in the `buildRun` method, add two setter calls to the `new CommentAiRun()` builder chain, after `.setPdfContentSha256(s.getPdfContentSha256())`:

```java
        .setPdfContentSha256(s.getPdfContentSha256())
        .setExternalRef(s.getExternalRef())
        .setExternalRefKind(s.getExternalRefKind())
```

- [ ] **Step 2: Emit the fields in `sourceJson`**

In `AiGenePublicationCommentService.java`, update both public `sourceJson` overloads to pass the two new values, and the private builder to emit them.

Replace the `sourceJson(JobSubmission s)` body:

```java
  static JSONObject sourceJson(JobSubmission s) {
    return sourceJson(s.getSourceKind(), s.getPubmedId(), s.getPdfContentSha256(),
        s.getExternalUrl(), s.getExternalTitle(), s.getExternalRef(), s.getExternalRefKind());
  }
```

Replace the `sourceJson(CommentAiRun run)` body:

```java
  static JSONObject sourceJson(CommentAiRun run) {
    return sourceJson(run.getSourceKind(), run.getPubmedId(), run.getPdfContentSha256(),
        run.getExternalUrl(), run.getExternalTitle(), run.getExternalRef(), run.getExternalRefKind());
  }
```

Replace the private builder:

```java
  private static JSONObject sourceJson(String kind, String pubmedId, String pdfContentSha256,
      String externalUrl, String externalTitle, String externalRef, String externalRefKind) {
    JSONObject source = new JSONObject().put("kind", kind);
    if ("pubmed".equals(kind)) {
      source.put("pubmed_id", pubmedId);
    }
    else {
      source.put("pdf_content_sha256", pdfContentSha256);
      // url/title/ref are optional upload provenance — omit when absent, mirroring
      // the NON_NULL behaviour of aiProvenance.source.
      if (externalUrl != null) source.put("external_url", externalUrl);
      if (externalTitle != null) source.put("external_title", externalTitle);
      if (externalRef != null) {
        source.put("external_ref", externalRef);
        source.put("external_ref_kind", externalRefKind);
      }
    }
    return source;
  }
```

- [ ] **Step 3: Build the Service module to verify it compiles**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite/Service && mvn clean test`
Expected: `BUILD SUCCESS`; all existing AI-package tests still pass (the buildRun/sourceJson changes are additive; existing tests that construct `CommentAiRun`/`JobSubmission` without an external_ref see `null`, which serialises as omitted).

- [ ] **Step 4: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite
git add Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationPipeline.java \
        Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationCommentService.java
git commit -m "feat(ai-comments): write external_ref to run row + source JSON

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Union upload-path PMID into the gene-page comments table — ApiCommonModel

**Files:**

- Modify: `Model/lib/wdk/model/records/commentTableQueries.xml` (the `<sqlQuery name="GeneComments">` `refs` sub-select, ~lines 131–143)

**Interfaces:**

- Consumes: the `comment_ai_run.external_ref` / `external_ref_kind` columns (already in the DB; written by Task 4).
- Produces: upload comments with `external_ref_kind='pubmed'` contribute their PMID to the `pmids` aggregate column.

- [ ] **Step 1: Add the third UNION branch**

In `commentTableQueries.xml`, inside `<sqlQuery name="GeneComments">`, find the `refs` sub-select. It currently reads:

```sql
              SELECT comment_id, string_agg(source_id,',') as pmids
              FROM (
                SELECT comment_id, source_id
                FROM @REMOTE_COMMENT_SCHEMA@CommentReference
                WHERE database_name='pubmed'
                UNION
                SELECT cap.comment_id, car.pubmed_id AS source_id
                FROM @REMOTE_COMMENT_SCHEMA@comment_ai_provenance cap
                JOIN @REMOTE_COMMENT_SCHEMA@comment_ai_run car ON cap.run_job_id = car.job_id
                WHERE car.source_kind = 'pubmed' AND car.pubmed_id IS NOT NULL
              ) merged
              GROUP BY comment_id
```

Add a third UNION branch before the `) merged` line, so it reads:

```sql
              SELECT comment_id, string_agg(source_id,',') as pmids
              FROM (
                SELECT comment_id, source_id
                FROM @REMOTE_COMMENT_SCHEMA@CommentReference
                WHERE database_name='pubmed'
                UNION
                SELECT cap.comment_id, car.pubmed_id AS source_id
                FROM @REMOTE_COMMENT_SCHEMA@comment_ai_provenance cap
                JOIN @REMOTE_COMMENT_SCHEMA@comment_ai_run car ON cap.run_job_id = car.job_id
                WHERE car.source_kind = 'pubmed' AND car.pubmed_id IS NOT NULL
                UNION
                SELECT cap.comment_id, car.external_ref AS source_id
                FROM @REMOTE_COMMENT_SCHEMA@comment_ai_provenance cap
                JOIN @REMOTE_COMMENT_SCHEMA@comment_ai_run car ON cap.run_job_id = car.job_id
                WHERE car.source_kind = 'upload'
                  AND car.external_ref_kind = 'pubmed'
                  AND car.external_ref IS NOT NULL
              ) merged
              GROUP BY comment_id
```

Leave the `CommunityComments`, `PopsetComments`, `GenomeComments`, and `PhenotypeComments` queries untouched (AI comments are gene-targeted; matches the `5c0a4a` precedent). Do **not** add a DOI branch — the `pmids` column feeds a PubMed link only.

- [ ] **Step 2: Verify the XML is well-formed**

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonModel && xmllint --noout Model/lib/wdk/model/records/commentTableQueries.xml && echo OK`
Expected: `OK` (no parse errors). Live query verification (a gene-page table showing the unioned PMID) is deferred to dev-server deploy, consistent with the rest of the SQL in this feature.

- [ ] **Step 3: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/ApiCommonModel
git add Model/lib/wdk/model/records/commentTableQueries.xml
git commit -m "feat(comments): union upload-path PMID into GeneComments pmids

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Extend FE types — `AiProvenanceSource` + `AiGenePublicationRequest`

**Files:**

- Modify: `types/userCommentTypes.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: the upload variant of `AiProvenanceSource` and `AiGenePublicationRequest` both carry optional `externalRef?: string` and `externalRefKind?: 'pubmed' | 'doi'`.

- [ ] **Step 1: Extend `AiProvenanceSource`**

In `types/userCommentTypes.ts`, replace the `upload` member of `AiProvenanceSource`:

```typescript
export type AiProvenanceSource =
  | { kind: 'pubmed'; pubmedId: string }
  | {
      kind: 'upload';
      externalUrl?: string;
      externalTitle?: string;
      // PDF content digest; lets the client match an uploaded PDF to an existing
      // published comment, the upload-path analogue of matching by PMID.
      pdfContentSha256?: string;
      // Optional PMID/DOI the user asserts for the uploaded PDF (display-only).
      externalRef?: string;
      externalRefKind?: 'pubmed' | 'doi';
    };
```

- [ ] **Step 2: Extend `AiGenePublicationRequest`**

In the same file, in the `AiGenePublicationRequest` interface, after `externalTitle?: string;` add:

```typescript
  externalRef?: string; // normalised PMID or DOI (upload path only)
  externalRefKind?: 'pubmed' | 'doi'; // kind of externalRef
```

- [ ] **Step 3: Verify type-check**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: clean (no new type errors).

- [ ] **Step 4: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts
git commit -m "feat(user-comments): externalRef on AiProvenanceSource + request type

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: FE detection helper + service mapping

**Files:**

- Create: `components/userComments/AiGenePublication/detectExternalRef.ts`
- Modify: `service/UserCommentsService.ts` (`postAiGenePublication` body builder + `toAiProvenanceSource`)

**Interfaces:**

- Consumes: types from Task 6.
- Produces: `detectExternalRef(input: string): { ref: string; kind: 'pubmed' | 'doi' } | undefined`. POST body includes `external_ref`/`external_ref_kind` when present on an upload request. `toAiProvenanceSource` populates `externalRef`/`externalRefKind` on the upload source.

- [ ] **Step 1: Create the detection helper**

Create `detectExternalRef.ts`:

```typescript
// Detect whether a free-text input is a PubMed id or a DOI. The two formats are
// structurally disjoint, so detection is reliable without a manual override.
// Mirrors the server-side rules in ExternalRef.java (keep the two in sync).
//
// Documented cases (verified manually — genomics-site has no unit-test runner):
//   '12345678'                          -> { ref: '12345678', kind: 'pubmed' }
//   'PMID: 12345678'                    -> { ref: '12345678', kind: 'pubmed' }
//   '10.1234/abc.def'                   -> { ref: '10.1234/abc.def', kind: 'doi' }
//   'https://doi.org/10.1234/abc.def'   -> { ref: '10.1234/abc.def', kind: 'doi' }
//   'abc' / '' / '   '                  -> undefined
const PMID = /^\d{1,9}$/;
const DOI = /^10\.\d{4,9}\/\S+$/;
const PMID_PREFIX = /^PMID:\s*/i;
const DOI_URL_PREFIX = /^https?:\/\/(dx\.)?doi\.org\//i;

export function detectExternalRef(
  input: string
): { ref: string; kind: 'pubmed' | 'doi' } | undefined {
  const trimmed = (input ?? '').trim();
  if (trimmed === '') return undefined;

  const asPmid = trimmed.replace(PMID_PREFIX, '').trim();
  if (PMID.test(asPmid)) return { ref: asPmid, kind: 'pubmed' };

  const asDoi = trimmed.replace(DOI_URL_PREFIX, '').trim();
  if (DOI.test(asDoi)) return { ref: asDoi, kind: 'doi' };

  return undefined;
}
```

- [ ] **Step 2: Send the fields in `postAiGenePublication`**

In `service/UserCommentsService.ts`, in `postAiGenePublication`, extend the upload branch of the body builder. Replace the `else { ... }` block:

```typescript
  } else {
    body.paper_text = request.paperText;
    body.pdf_content_sha256 = request.pdfContentSha256;
    if (request.externalUrl) body.external_url = request.externalUrl;
    if (request.externalTitle) body.external_title = request.externalTitle;
    if (request.externalRef) {
      body.external_ref = request.externalRef;
      body.external_ref_kind = request.externalRefKind;
    }
  }
```

- [ ] **Step 3: Read the fields in `toAiProvenanceSource`**

In the same file, extend the upload object returned by `toAiProvenanceSource`:

```typescript
function toAiProvenanceSource(s: any): AiProvenanceSource {
  return s.kind === 'pubmed'
    ? { kind: 'pubmed', pubmedId: s.pubmed_id }
    : {
        kind: 'upload',
        pdfContentSha256: s.pdf_content_sha256,
        externalUrl: s.external_url,
        externalTitle: s.external_title,
        externalRef: s.external_ref,
        externalRefKind: s.external_ref_kind,
      };
}
```

- [ ] **Step 4: Verify type-check**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/detectExternalRef.ts \
        packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts
git commit -m "feat(user-comments): detectExternalRef helper + service mapping

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: FE controller — hold `externalRef` + include in submit

**Files:**

- Modify: `controllers/AiGenePublicationAddController.tsx`

**Interfaces:**

- Consumes: `detectExternalRef` (Task 7); `AiGenePublicationRequest` (Task 6).
- Produces: controller state `externalRef: string` + `onExternalRefChange`; upload submit request carries `externalRef`/`externalRefKind` when detected. The form props object passed to the view gains `externalRef` + `onExternalRefChange`.

- [ ] **Step 1: Add controller state**

In `AiGenePublicationAddController.tsx`, after the `externalTitle` state declaration:

```typescript
const [externalTitle, setExternalTitle] = useState('');
const [externalRef, setExternalRef] = useState('');
```

- [ ] **Step 2: Import the helper**

Add to the imports at the top of the file (regular import — no `import type`):

```typescript
import { detectExternalRef } from '../components/userComments/AiGenePublication/detectExternalRef';
```

(Adjust the relative path if the controller's import block uses a different depth for `components/...`; match the existing imports of sibling AiGenePublication components in this file.)

- [ ] **Step 3: Include the detected ref in the upload submit request**

In `handleSubmit`, inside the `source === 'upload'` request object, add the detected ref. First, just above the `const request = ...`, compute it:

```typescript
const detectedRef =
  source === 'upload' ? detectExternalRef(externalRef) : undefined;
```

Then in the upload branch of the `request` object, after `externalTitle: trimmedTitle || undefined,` add:

```typescript
            externalTitle: trimmedTitle || undefined,
            externalRef: detectedRef?.ref,
            externalRefKind: detectedRef?.kind,
```

- [ ] **Step 4: Pass state down to the view's form props**

Locate where the controller builds the `form` props object handed to `AiGenePublicationAddView` (it already passes `externalUrl`, `onExternalUrlChange`, `externalTitle`, `onExternalTitleChange`). Add alongside them:

```typescript
        externalRef,
        onExternalRefChange: setExternalRef,
```

- [ ] **Step 5: Verify type-check**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: clean (the view prop type is extended in Task 9; if `compile:check` flags an unknown prop here, proceed to Task 9 — the two are a single reviewer gate if needed, but the controller change alone should type-check since the form-props object is structurally typed at the view boundary). If it errors on the new props, do Task 9 Step 1 (the prop type) before re-running.

- [ ] **Step 6: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/AiGenePublicationAddController.tsx
git commit -m "feat(user-comments): controller holds + submits externalRef

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: FE add-view — optional field, debounced chip, inline preview

**Files:**

- Modify: `components/userComments/AiGenePublication/AiGenePublicationAddView.tsx`

**Interfaces:**

- Consumes: `detectExternalRef` (Task 7); `LazyPubmedPreview` (existing); controller props `externalRef` + `onExternalRefChange` (Task 8).
- Produces: the upload tab renders the optional "PubMed ID or DOI" field with a debounced detected-kind chip and an inline PubMed preview / DOI link.

- [ ] **Step 1: Extend the view's form-props type**

In `AiGenePublicationAddView.tsx`, find the props interface/type describing `form` (it lists `externalUrl: string; onExternalUrlChange: ...; externalTitle: string; onExternalTitleChange: ...`). Add:

```typescript
  externalRef: string;
  onExternalRefChange: (value: string) => void;
```

- [ ] **Step 2: Add imports**

Add to the imports at the top:

```typescript
import { detectExternalRef } from './detectExternalRef';
import { LazyPubmedPreview } from '../UserCommentShow/LazyPubmedPreview';
```

- [ ] **Step 3: Add a debounced detection sub-component**

Near the top of the file (after imports, before the main component), add a small presentational helper that debounces detection for display only:

```typescript
function ExternalRefHint({ value }: { value: string }): JSX.Element | null {
  const [detected, setDetected] = useState<
    { ref: string; kind: 'pubmed' | 'doi' } | undefined
  >(undefined);

  useEffect(() => {
    const handle = setTimeout(() => setDetected(detectExternalRef(value)), 400);
    return () => clearTimeout(handle);
  }, [value]);

  if (!detected) return null;

  return (
    <div style={{ marginTop: '6px' }}>
      <span
        style={{
          display: 'inline-block',
          padding: '1px 8px',
          borderRadius: '8px',
          backgroundColor: '#0a7c8a',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        {detected.kind === 'pubmed' ? 'PubMed ID' : 'DOI'} detected
      </span>
      {detected.kind === 'pubmed' ? (
        <div style={{ marginTop: '8px' }}>
          <LazyPubmedPreview pubmedId={detected.ref} />
        </div>
      ) : (
        <div style={{ marginTop: '6px', fontSize: '14px' }}>
          <a
            href={`https://doi.org/${detected.ref}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            https://doi.org/{detected.ref}
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Render the field on the upload tab**

In the upload-path JSX, after the existing "Link text" (`externalTitle`) field's closing `</div>` and before the upload-path wrapper's closing `</div>`, add:

```typescript
<div style={{ marginBottom: '8px' }}>
  <label
    htmlFor="ai-external-ref-input"
    style={{
      display: 'block',
      fontWeight: 500,
      marginBottom: '4px',
      fontSize: '14px',
    }}
  >
    PubMed ID or DOI (optional)
  </label>
  <TextBox
    id="ai-external-ref-input"
    value={form.externalRef}
    onChange={form.onExternalRefChange}
    placeholder="e.g. 12345678 or 10.1234/abc"
    style={{ width: '400px' }}
  />
  <ExternalRefHint value={form.externalRef} />
</div>
```

- [ ] **Step 5: Verify type-check**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: clean.

- [ ] **Step 6: Manual browser check**

Start the dev server (`yarn nx start @veupathdb/genomics-site`), log in, go to `/user-comments/ai-gene-publication/add?stableId=PF3D7_0315200`, switch to the Upload tab:

- Type `12345678` → after ~400ms a "PubMed ID detected" chip + a PubMed citation preview appears.
- Type `10.1234/abc.def` → "DOI detected" chip + a `doi.org` link.
- Type `garbage` → no chip; Submit still enabled (field is optional).
- DevTools → Network: with a valid PDF extracted and a PMID typed, the POST body carries `external_ref` + `external_ref_kind`; with the field blank, neither key is present.

- [ ] **Step 7: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationAddView.tsx
git commit -m "feat(user-comments): upload-tab PMID/DOI field with detected-kind chip

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: FE show-page — render `externalRef` provenance

**Files:**

- Modify: `components/userComments/UserCommentShow/AiProvenanceSection.tsx`

**Interfaces:**

- Consumes: `AiProvenanceSource.upload.externalRef`/`externalRefKind` (Task 6, populated by Task 7's service mapping + the BE read path); `LazyPubmedPreview`, `Row` (existing).
- Produces: a published upload comment with an `externalRef` shows it (PubMed preview for `pubmed`, `doi.org` link for `doi`) in its provenance section.

- [ ] **Step 1: Render the external ref in the upload branch**

In `AiProvenanceSection.tsx`, in the `else` (upload) branch, after the existing "Source publication" `<Row>` block, add a second row for the asserted ref. Replace the upload branch's `<Row label="Source publication"> ... </Row>` with that same row followed by:

```typescript
{
  source.externalRef &&
    (source.externalRefKind === 'pubmed' ? (
      <Row label="PubMed Article(s)">
        <LazyPubmedPreview pubmedId={source.externalRef} />
      </Row>
    ) : (
      <Row label="DOI">
        <a
          href={`https://doi.org/${source.externalRef}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          https://doi.org/{source.externalRef}
        </a>
      </Row>
    ));
}
```

(`LazyPubmedPreview` is already imported in this file. Place the new block inside the upload `<>...</>` fragment, after the existing source-publication `Row`.)

- [ ] **Step 2: Confirm no other consumer renders the upload source**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && grep -rn "source.externalUrl\|kind === 'upload'\|kind: 'upload'" packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments`
Expected: the only display consumer is `AiProvenanceSection.tsx`. If the pre-publish review view (`AiCommentReviewView.tsx`) renders the source independently, apply the same two-row pattern there. (The typed-in preview during entry is already covered by Task 9's `ExternalRefHint`.)

- [ ] **Step 3: Verify type-check**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: clean.

- [ ] **Step 4: Manual browser check**

On the dev server, view `/user-comments/show?stableId=...` (or the gene-page comments) for a published upload comment that had a PMID ref → the provenance section shows the "PubMed Article(s)" preview; one with a DOI shows the "DOI" link. Confirm the PMID does **not** also appear in a separate references/PMID(s) sidecar row (it rides on `aiProvenance` only).

- [ ] **Step 5: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/AiProvenanceSection.tsx
git commit -m "feat(user-comments): show external_ref (PMID/DOI) in AI provenance

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**

- "Not in digest / not in lookups" → Task 1/2 (regexes + validate) + Global Constraints; Task 2 nulls it on the pubmed path and never passes it to `JobDigest`. ✓
- FE optional field + debounced chip + PubMed preview + no override → Task 9. ✓
- No title-grep / no extra LLM check → enforced by omission (not built); noted in spec. ✓
- Display surface 1 (comment service / show page) → Task 3 (read path) + Task 4 (source JSON) + Task 7 (FE mapping) + Task 10 (render). ✓
- Display surface 2 (GeneComments `pmids` aggregate, third UNION branch, pubmed-only) → Task 5. ✓
- BE normalisation/validation (strip prefixes, 400 on malformed) → Task 1 + Task 2. ✓
- DOI → `doi.org` link, asymmetric with PubMed chip → Task 9 + Task 10. ✓
- Run-row-only storage, no publish-body change → Tasks 3/4 store on the run row; publish path untouched. ✓
- Migration scripting out of scope → not in any task; stated in Global Constraints. ✓

**Placeholder scan:** No TBD/TODO; every code step shows real code. Task 10 Step 2 is a concrete grep + conditional follow-up (not a vague "handle other cases").

**Type consistency:**

- `detectExternalRef(input: string): { ref: string; kind: 'pubmed' | 'doi' } | undefined` — defined Task 7, used Tasks 8 & 9. ✓
- `ExternalRef.normalise(String, String) -> Result{ref, kind}` — defined Task 1, used Task 2. ✓
- `AiProvenanceView.Source.upload(externalUrl, externalTitle, pdfContentSha256, externalRef, externalRefKind)` 5-arg — defined Task 3, only caller (`GetCommentAiProvenanceQuery`) updated in the same task. ✓
- `CommentAiRun.setExternalRef/.setExternalRefKind/.getExternalRef/.getExternalRefKind` — defined Task 3, used Tasks 4 (Service) and Task 3 (queries). ✓
- `JobSubmission.getExternalRef/.getExternalRefKind` — defined Task 2, used Task 4. ✓
- Wire keys `external_ref` / `external_ref_kind` — consistent across Tasks 2 (DTO), 3 (SQL), 4 (source JSON), 7 (FE body + mapping). ✓
