import { describe, test, expect } from 'vitest';
import { MdocFileParser } from '../../../src/helperModules/MdocFileParser';
import { PageBuilder } from '../../../src/helperModules/PageBuilder';
import { YamlConfigParser } from '../../../src/helperModules/YamlConfigParser';
import {
  VALID_CONTENT_DIR,
  VALID_PARTIALS_DIR,
  VALID_PREF_OPTIONS_DIR,
  SNAPSHOTS_DIR
} from '../../config/constants';

describe('PageBuilder.build', () => {
  const testFilePath = VALID_CONTENT_DIR + '/primary_colors.mdoc';
  const prefOptionsConfig =
    YamlConfigParser.loadPrefOptionsFromDir(VALID_PREF_OPTIONS_DIR);

  const sanitizedMarkdocFilename = testFilePath.replace(VALID_CONTENT_DIR, '');

  const parsedFile = MdocFileParser.parseMdocFile(testFilePath, VALID_PARTIALS_DIR);

  const prefOptionsConfigForPage = YamlConfigParser.getPrefOptionsForPage(
    parsedFile.frontmatter,
    prefOptionsConfig
  );

  const html = PageBuilder.build({
    parsedFile,
    prefOptionsConfig: prefOptionsConfigForPage,
    debug: true,
    includeAssetsInline: false,
    outputFormat: 'html'
  });

  test(`builds an HTML string for ${sanitizedMarkdocFilename} that matches the snapshot`, () => {
    expect(html).toMatchFileSnapshot(
      `${SNAPSHOTS_DIR}/helperModules/PageBuilder/${sanitizedMarkdocFilename}/compiledHtml.snap.html`
    );
  });
});
