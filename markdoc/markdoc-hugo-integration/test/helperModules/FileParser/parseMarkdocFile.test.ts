import { describe, test, expect } from 'vitest';
import { FileParser } from '../../../src/helperModules/FileParser';
import {
  VALID_CONTENT_DIR,
  VALID_PARTIALS_DIR,
  SNAPSHOTS_DIR
} from '../../config/constants';

describe('FileParse.parseMdocFile', () => {
  const testFilePath = VALID_CONTENT_DIR + '/primary_colors.mdoc';

  const sanitizedMarkdocFilename = testFilePath.replace(VALID_CONTENT_DIR, '');
  const { ast, frontmatter, partials, errorReports } = FileParser.parseMdocFile(
    testFilePath,
    VALID_PARTIALS_DIR
  );

  test(`creates an AST for ${sanitizedMarkdocFilename} that matches the snapshot`, () => {
    expect(ast).toBeDefined();
    expect(JSON.stringify(ast, null, 2)).toMatchFileSnapshot(
      `${SNAPSHOTS_DIR}/validSite/compilationStepsByFilename/${sanitizedMarkdocFilename}/ast.snap.json`
    );
  });

  test(`creates frontmatter for ${sanitizedMarkdocFilename} that matches the snapshot`, () => {
    expect(frontmatter).toBeDefined();
    expect(JSON.stringify(frontmatter, null, 2)).toMatchFileSnapshot(
      `${SNAPSHOTS_DIR}/validSite/compilationStepsByFilename/${sanitizedMarkdocFilename}/frontmatter.snap.json`
    );
  });

  test(`creates partials for ${sanitizedMarkdocFilename} that match the snapshot`, () => {
    expect(partials).toBeDefined();
    expect(JSON.stringify(partials, null, 2)).toMatchFileSnapshot(
      `${SNAPSHOTS_DIR}/validSite/compilationStepsByFilename/${sanitizedMarkdocFilename}/partials.snap.json`
    );
  });

  test(`does not encounter any errors for ${sanitizedMarkdocFilename}`, () => {
    expect(errorReports).toBeDefined();
    expect(errorReports.length).toEqual(0);
  });
});
