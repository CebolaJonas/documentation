export const CodeBlockTemplate = (props: {
  highlightedContents: string;
  attrs: {
    filename?: string;
    wrap: boolean;
    collapsible: boolean;
    disable_copy: boolean;
  };
}) => {
  const { highlightedContents, attrs } = props;

  let filenameWrapperClasses = 'd-flex';
  if (attrs.filename) {
    filenameWrapperClasses += ' justify-content-between';
  } else {
    filenameWrapperClasses += ' justify-content-end';
  }
  if (attrs.collapsible) {
    filenameWrapperClasses += ' collapsible';
  }

  let codeSnippetClasses = '';
  if (attrs.wrap) {
    codeSnippetClasses = 'wrap';
  }

  return (
    <div className="code-snippet-wrapper">
      <div className={`code-filename-wrapper ${filenameWrapperClasses}`}>
        {attrs.filename && <p className="code-filename my-0">{attrs.filename}</p>}
        {attrs.collapsible && (
          <div className="js-code-block-visibility-toggle">
            <div className="chevron chevron-down d-none"></div>
            <div className="chevron chevron-up"></div>
          </div>
        )}
      </div>
      <div className={`code-snippet ${codeSnippetClasses}`}>
        {!attrs.disable_copy && (
          <div className="code-button-wrapper position-absolute">
            <button className="btn text-primary js-copy-button">Copy</button>
          </div>
        )}
        <span dangerouslySetInnerHTML={{ __html: highlightedContents }}></span>
      </div>
    </div>
  );
};
