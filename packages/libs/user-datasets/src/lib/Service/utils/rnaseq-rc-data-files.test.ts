import {
  buildRnaSeqRcDataFiles,
  utf8ByteLength,
  SAMPLE_INFO_FIELD_NAME,
  SAMPLE_INFO_MAX_BYTES
} from './rnaseq-rc-data-files';
import { newUploadContent, UploadContent } from '../Model';
import { FIELD_NAME_DATA_FILE } from '../../Common/Forms/form-constants';

const file = (name: string, content = 'gene\tS1\nA\t1\n'): UploadContent =>
  newUploadContent(new File([ content ], name, { type: 'text/plain' }));

const read = (f: UploadContent) => new Response(f.toFile()).text();

const byName = (files: readonly UploadContent[], name: string) => {
  const hit = files.find((f) => f.name === name);
  if (hit == null)
    throw new Error(`no file named ${name} in [${files.map((f) => f.name)}]`);
  return hit;
};

const DATA_FILE_FIELD_NAME = FIELD_NAME_DATA_FILE.toString();

describe('utf8ByteLength', () => {
  it('counts UTF-8 bytes, not UTF-16 code units', () => {
    expect(utf8ByteLength('hello')).toBe(5);
    expect(utf8ByteLength('é')).toBe(2);
    expect(utf8ByteLength('日本語')).toBe(9);
  });
});

describe('buildRnaSeqRcDataFiles — unstranded', () => {
  it('returns the count file plus sample-info and manifest', () => {
    const result = buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('HTSeq_run3.txt')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    });

    expect(Object.values(result).flat(2).map((f) => f.name).sort()).toEqual([
      'HTSeq_run3.txt',
      'manifest.tsv',
      'sample-info.txt',
    ]);
  });

  it('writes an unstranded manifest with a trailing newline', async () => {
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('HTSeq_run3.txt')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).flat(2);

    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'unstranded\tHTSeq_run3.txt\nsample-info\tsample-info.txt\n'
    );
  });

  it('puts the description verbatim into sample-info.txt', async () => {
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('c.tsv')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'S1 infected\nS2 control')],
    })).flat(2);

    expect(await read(byName(result, 'sample-info.txt'))).toBe(
      'S1 infected\nS2 control'
    );
  });

  it('generates an empty sample-info.txt when no description is given', async () => {
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('c.tsv')],
    })).flat(2);

    expect(await read(byName(result, 'sample-info.txt'))).toBe('');
  });
});

describe('buildRnaSeqRcDataFiles — stranded', () => {
  it('writes a sense/antisense manifest in slot order', async () => {
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('my_sense.tsv'), file('my_anti.tsv')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).flat(2);

    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'sense\tmy_sense.tsv\nantisense\tmy_anti.tsv\nsample-info\tsample-info.txt\n'
    );
  });
});

describe('buildRnaSeqRcDataFiles — generated names yield on collision', () => {
  it('renames its own sample-info when the user file claims that name', async () => {
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('sample-info.txt')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).flat(2);

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
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('sample-info.txt'), file('sample-info-1.txt')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).flat(2);

    expect(result.map((f) => f.name)).toContain('sample-info-2.txt');
  });

  it('yields sample-info to a user file matching case-insensitively', () => {
    const result = Object.values(buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [ file('Sample-Info.TXT') ],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).flat(2);

    expect(result.map((f) => f.name)).toContain('sample-info-1.txt');
  });
});

describe('buildRnaSeqRcDataFiles — manifest name is reserved', () => {
  it('throws rather than renaming when a count file is named manifest.tsv', () => {
    expect(() => buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('manifest.tsv')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).toThrow(/manifest\.tsv/);
  });

  it('throws when the collision only matches case-insensitively', () => {
    expect(() => buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('Manifest.TSV')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'notes')],
    })).toThrow(/Manifest\.TSV/);
  });
});

describe('buildRnaSeqRcDataFiles — rejections', () => {
  it('rejects a disallowed extension', () => {
    expect(() => buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('counts.xlsx')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'n')],
    })).toThrow(/counts\.xlsx/);
  });

  it('accepts extensions case-insensitively', () => {
    expect(() => buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [file('Counts.CSV')],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'n')],
    })).not.toThrow();
  });

  it('rejects an empty file list', () => {
    expect(() => buildRnaSeqRcDataFiles({
      [DATA_FILE_FIELD_NAME]: [],
      [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'n')],
    })).toThrow(/at least one/i);
  });

  it('rejects more files than there are roles', () => {
    expect(() =>
      buildRnaSeqRcDataFiles({
        [DATA_FILE_FIELD_NAME]: [file('a.tsv'), file('b.tsv'), file('c.tsv')],
        [SAMPLE_INFO_FIELD_NAME]: [file('sample-info.txt', 'n')],
      })
    ).toThrow(/at most two/i);
  });
});

describe('SAMPLE_INFO_MAX_BYTES', () => {
  it('matches the plugin cap', () => {
    expect(SAMPLE_INFO_MAX_BYTES).toBe(100000);
  });
});
