import {
  buildRnaSeqRcDataFiles,
  findDuplicateFileName,
  findManifestNameCollision,
  hasAllowedExtension,
  hasTabInName,
  MANIFEST_NAME,
  SAMPLE_INFO_MAX_BYTES,
  utf8ByteLength,
} from './rnaseq-rc-data-files';

const EXTS = ['.txt', '.tsv', '.csv', '.tab'];

const file = (name: string, content = 'gene\tS1\nA\t1\n') =>
  new File([content], name, { type: 'text/plain' });

const read = (f: File) => new Response(f).text();

const byName = (files: readonly File[], name: string) => {
  const hit = files.find((f) => f.name === name);
  if (hit == null)
    throw new Error(`no file named ${name} in [${files.map((f) => f.name)}]`);
  return hit;
};

describe('utf8ByteLength', () => {
  it('counts UTF-8 bytes, not UTF-16 code units', () => {
    expect(utf8ByteLength('hello')).toBe(5);
    expect(utf8ByteLength('é')).toBe(2);
    expect(utf8ByteLength('日本語')).toBe(9);
  });
});

describe('buildRnaSeqRcDataFiles — unstranded', () => {
  it('returns the count file plus sample-info and manifest', () => {
    const result = buildRnaSeqRcDataFiles(
      [file('HTSeq_run3.txt')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name).sort()).toEqual([
      'HTSeq_run3.txt',
      'manifest.tsv',
      'sample-info.txt',
    ]);
  });

  it('writes an unstranded manifest with a trailing newline', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('HTSeq_run3.txt')],
      'notes',
      EXTS
    );

    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'unstranded\tHTSeq_run3.txt\nsample-info\tsample-info.txt\n'
    );
  });

  it('puts the description verbatim into sample-info.txt', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('c.tsv')],
      'S1 infected\nS2 control',
      EXTS
    );

    expect(await read(byName(result, 'sample-info.txt'))).toBe(
      'S1 infected\nS2 control'
    );
  });

  it('generates an empty sample-info.txt when no description is given', async () => {
    const result = buildRnaSeqRcDataFiles([file('c.tsv')], undefined, EXTS);

    expect(await read(byName(result, 'sample-info.txt'))).toBe('');
  });
});

describe('buildRnaSeqRcDataFiles — stranded', () => {
  it('writes a sense/antisense manifest in slot order', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('my_sense.tsv'), file('my_anti.tsv')],
      'notes',
      EXTS
    );

    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'sense\tmy_sense.tsv\nantisense\tmy_anti.tsv\nsample-info\tsample-info.txt\n'
    );
  });
});

describe('buildRnaSeqRcDataFiles — generated names yield on collision', () => {
  it('renames its own sample-info when the user file claims that name', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('sample-info.txt')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name).sort()).toEqual([
      'manifest.tsv',
      'sample-info-1.txt',
      'sample-info.txt',
    ]);
    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'unstranded\tsample-info.txt\nsample-info\tsample-info-1.txt\n'
    );
  });

  it('keeps counting up when the first fallback is also taken', () => {
    const result = buildRnaSeqRcDataFiles(
      [file('sample-info.txt'), file('sample-info-1.txt')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name)).toContain('sample-info-2.txt');
  });

  it('yields sample-info to a user file matching case-insensitively', () => {
    const result = buildRnaSeqRcDataFiles(
      [file('Sample-Info.TXT')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name)).toContain('sample-info-1.txt');
  });
});

describe('buildRnaSeqRcDataFiles — manifest name is reserved', () => {
  it('throws rather than renaming when a count file is named manifest.tsv', () => {
    expect(() =>
      buildRnaSeqRcDataFiles([file('manifest.tsv')], 'notes', EXTS)
    ).toThrow(/manifest\.tsv/);
  });

  it('throws when the collision only matches case-insensitively', () => {
    expect(() =>
      buildRnaSeqRcDataFiles([file('Manifest.TSV')], 'notes', EXTS)
    ).toThrow(/Manifest\.TSV/);
  });
});

describe('buildRnaSeqRcDataFiles — rejections', () => {
  it('rejects a disallowed extension', () => {
    expect(() =>
      buildRnaSeqRcDataFiles([file('counts.xlsx')], 'n', EXTS)
    ).toThrow(/counts\.xlsx/);
  });

  it('accepts extensions case-insensitively', () => {
    expect(() =>
      buildRnaSeqRcDataFiles([file('Counts.CSV')], 'n', EXTS)
    ).not.toThrow();
  });

  it('rejects an empty file list', () => {
    expect(() => buildRnaSeqRcDataFiles([], 'n', EXTS)).toThrow(
      /at least one/i
    );
  });

  it('rejects more files than there are roles', () => {
    expect(() =>
      buildRnaSeqRcDataFiles(
        [file('a.tsv'), file('b.tsv'), file('c.tsv')],
        'n',
        EXTS
      )
    ).toThrow(/at most two/i);
  });
});

describe('findDuplicateFileName', () => {
  it('finds a repeated basename', () => {
    expect(
      findDuplicateFileName([file('counts.tsv'), file('counts.tsv')])
    ).toBe('counts.tsv');
  });

  it('returns undefined when all names differ', () => {
    expect(
      findDuplicateFileName([file('a.tsv'), file('b.tsv')])
    ).toBeUndefined();
  });

  it('finds a repeated basename that only matches case-insensitively', () => {
    expect(
      findDuplicateFileName([file('Counts.tsv'), file('counts.TSV')])
    ).toBe('counts.TSV');
  });
});

describe('hasTabInName', () => {
  it('finds a tab in a filename', () => {
    expect(hasTabInName([file('od\td.tsv')])).toBe('od\td.tsv');
  });

  it('returns undefined for clean names', () => {
    expect(hasTabInName([file('fine.tsv')])).toBeUndefined();
  });
});

describe('findManifestNameCollision', () => {
  it('finds a count file named exactly manifest.tsv', () => {
    expect(findManifestNameCollision([file(MANIFEST_NAME)])).toBe(
      MANIFEST_NAME
    );
  });

  it('finds a collision that only matches case-insensitively', () => {
    expect(findManifestNameCollision([file('Manifest.TSV')])).toBe(
      'Manifest.TSV'
    );
  });

  it('returns undefined when no file collides', () => {
    expect(findManifestNameCollision([file('counts.tsv')])).toBeUndefined();
  });
});

describe('hasAllowedExtension', () => {
  it('matches an allowed extension case-insensitively', () => {
    expect(hasAllowedExtension('Counts.CSV', EXTS)).toBe(true);
  });

  it('rejects a name matching none of the extensions', () => {
    expect(hasAllowedExtension('counts.xlsx', EXTS)).toBe(false);
  });
});

describe('SAMPLE_INFO_MAX_BYTES', () => {
  it('matches the plugin cap', () => {
    expect(SAMPLE_INFO_MAX_BYTES).toBe(100000);
  });
});
