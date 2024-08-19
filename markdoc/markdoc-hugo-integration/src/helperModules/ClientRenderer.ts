/**
 * A class containing functions for rendering on the client.
 * When a new page loads, it should call ClientRenderer.initialize()
 * in order to set up the ClientRenderer with the necessary data
 * for re-rendering the content and the chooser
 * in response to user selection changes.
 *
 * There should only be one instance of the ClientRenderer
 * in the application, with the configuration
 * updating as various pages are loaded.
 *
 * The ClientRenderer is provided in the assets partial string
 * generated by MarkdocHugoIntegration.buildAssetsPartial().
 * The contents of that partial should be included
 * in the head of the main page layout.
 */

import { getChooserHtml } from './PageBuilder/components/Chooser';
import { MinifiedPrefOptionsConfig } from '../schemas/yaml/prefOptions';
import { MinifiedPagePrefsConfig } from '../schemas/yaml/frontMatter';
import { ClientFunction } from 'markdoc-static-compiler/src/types';
import { resolveMinifiedPagePrefs } from './sharedRendering';
import { reresolveFunctionNode } from 'markdoc-static-compiler/src/reresolver';
import { expandClientFunction, MinifiedClientFunction } from './dataCompression';

export class ClientRenderer {
  static #instance: ClientRenderer;

  private prefOptionsConfig?: MinifiedPrefOptionsConfig;
  private pagePrefsConfig?: MinifiedPagePrefsConfig;
  private chooserElement?: HTMLElement;
  private selectedValsByPrefId: Record<string, string> = {};
  private ifFunctionsByRef: Record<string, ClientFunction> = {};
  private storedPreferences: Record<string, string> = {};

  private constructor() {}

  /**
   * Return the existing instance,
   * or create a new one if none exists.
   */
  public static get instance(): ClientRenderer {
    if (!ClientRenderer.#instance) {
      ClientRenderer.#instance = new ClientRenderer();
      ClientRenderer.#instance.retrieveStoredPreferences();
    }

    return ClientRenderer.#instance;
  }

  retrieveStoredPreferences() {
    const storedPreferences = JSON.parse(localStorage.getItem('content-prefs') || '{}');
    this.storedPreferences = storedPreferences;
  }

  updateStoredPreferences() {
    const storedPreferences = JSON.parse(localStorage.getItem('content-prefs') || '{}');
    const newStoredPreferences = {
      ...storedPreferences,
      ...this.selectedValsByPrefId
    };
    this.storedPreferences = newStoredPreferences;
    localStorage.setItem('content-prefs', JSON.stringify(newStoredPreferences));
  }

  getSelectedValsFromUrl() {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const selectedValsByPrefId: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      if (key in Object.keys(this.selectedValsByPrefId)) {
        selectedValsByPrefId[key] = val;
      }
    });

    return selectedValsByPrefId;
  }

  syncUrlWithSelectedVals() {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const sortedPrefIds = Object.keys(this.selectedValsByPrefId).sort();

    // Apply selected values
    sortedPrefIds.forEach((prefId) => {
      searchParams.set(prefId, this.selectedValsByPrefId[prefId]);
    });

    window.history.replaceState({}, '', url.toString());
  }

  /**
   * When the user changes a preference value,
   * update the selected values data,
   * and rerender the chooser and page content.
   */
  handlePrefSelectionChange(e: Event) {
    const node = e.target;
    if (!(node instanceof Element)) {
      return;
    }
    const prefId = node.getAttribute('data-pref-id');
    if (!prefId) {
      return;
    }
    const optionId = node.getAttribute('data-option-id');
    if (!optionId) {
      return;
    }

    this.selectedValsByPrefId[prefId] = optionId;
    this.rerenderChooser();
    this.rerenderPageContent();
    this.populateRightNav();
    this.syncUrlWithSelectedVals();
    this.updateStoredPreferences();
  }

  /**
   * Check whether the element or any of its ancestors
   * have the class 'markdoc__hidden'.
   */
  elementIsHidden(element: Element) {
    // check whether the element or any of its parents are hidden
    let currentElement: Element | null = element;
    while (currentElement) {
      if (currentElement.classList.contains('markdoc__hidden')) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
  }

  /**
   * Should run after the page has been rendered.
   */
  populateRightNav() {
    let html = '<ul>';
    const headers = Array.from(
      document.querySelectorAll('#mainContent h2, #mainContent h3')
    );
    let lastSeenLevel = 2;
    headers.forEach((header) => {
      if (this.elementIsHidden(header)) {
        return;
      }

      // Start or end a list if the level has changed
      const level = parseInt(header.tagName[1]);
      if (level === lastSeenLevel) {
        html += '</li>';
      } else if (level > lastSeenLevel) {
        html += '<ul>';
      } else if (level < lastSeenLevel) {
        html += '</ul></li>';
      }
      lastSeenLevel = level;

      html += `<li><a href="#${header.id}">${header.textContent}</a>`;
    });
    html += '</li></ul>';
    const rightNav = document.getElementById('TableOfContents');
    if (!rightNav) {
      return;
    }
    rightNav.innerHTML = html;
    // @ts-ignore
    window.TOCFunctions.buildTOCMap();
    // @ts-ignore
    window.TOCFunctions.onScroll();
  }

  rerender() {
    this.rerenderChooser();
    this.rerenderPageContent();
  }

  /**
   * Rerender the section of the page that was derived
   * from the author's .mdoc file.
   */
  rerenderPageContent() {
    const newDisplayStatusByRef: Record<string, boolean> = {};

    // Update the resolved function values,
    // and make a list of refs that require a display status change
    Object.keys(this.ifFunctionsByRef).forEach((ref) => {
      const clientFunction = this.ifFunctionsByRef[ref];
      const oldValue = clientFunction.value;
      const resolvedFunction = reresolveFunctionNode(clientFunction, {
        variables: this.selectedValsByPrefId
      });
      this.ifFunctionsByRef[ref] = resolvedFunction;
      if (oldValue !== resolvedFunction.value) {
        newDisplayStatusByRef[ref] = resolvedFunction.value;
      }
    });

    const toggleables = document.getElementsByClassName('markdoc__toggleable');
    for (let i = 0; i < toggleables.length; i++) {
      const toggleable = toggleables[i];

      const ref = toggleable.getAttribute('data-if');

      if (!ref) {
        throw new Error('No ref found on toggleable element');
      }
      if (newDisplayStatusByRef[ref] === undefined) {
        continue;
      }

      if (newDisplayStatusByRef[ref]) {
        toggleable.classList.remove('markdoc__hidden');
      } else {
        toggleable.classList.add('markdoc__hidden');
      }
    }
  }

  /**
   * Listen for selection changes in the chooser.
   */
  addChooserEventListeners() {
    const prefPills = document.getElementsByClassName('markdoc-pref__pill');
    for (let i = 0; i < prefPills.length; i++) {
      prefPills[i].addEventListener('click', (e) => this.handlePrefSelectionChange(e));
    }
  }

  locateChooserElement() {
    const chooserElement = document.getElementById('markdoc-chooser');
    if (!chooserElement) {
      throw new Error('Cannot find chooser element with id "markdoc-chooser"');
    } else {
      this.chooserElement = chooserElement;
    }
  }

  applyPrefOverrides() {
    const relevantPrefIds = Object.keys(this.selectedValsByPrefId);
    let prefOverrideFound = false;

    // Override default values with stored preferences
    Object.keys(this.storedPreferences).forEach((prefId) => {
      if (
        relevantPrefIds.includes(prefId) &&
        this.selectedValsByPrefId[prefId] !== this.storedPreferences[prefId]
      ) {
        this.selectedValsByPrefId[prefId] = this.storedPreferences[prefId];
        prefOverrideFound = true;
      }
    });

    // Override stored preferences with URL params
    const urlPrefs = this.getSelectedValsFromUrl();
    Object.keys(urlPrefs).forEach((prefId) => {
      if (
        relevantPrefIds.includes(prefId) &&
        this.selectedValsByPrefId[prefId] !== urlPrefs[prefId]
      ) {
        this.selectedValsByPrefId[prefId] = urlPrefs[prefId];
        prefOverrideFound = true;
      }
    });

    return prefOverrideFound;
  }

  updateEditButton() {
    const editButton = document.getElementsByClassName('toc-edit-btn')[0];
    if (!editButton) {
      return;
    }
    const editButtonLink = editButton.getElementsByTagName('a')[0];
    if (!editButtonLink) {
      return;
    }
    editButtonLink.href = editButtonLink.href.replace(/\.md\/$/, '.mdoc/');
  }

  initialize(p: {
    prefOptionsConfig: MinifiedPrefOptionsConfig;
    pagePrefsConfig: MinifiedPagePrefsConfig;
    selectedValsByPrefId?: Record<string, string>;
    ifFunctionsByRef: Record<string, MinifiedClientFunction>;
  }) {
    this.prefOptionsConfig = p.prefOptionsConfig;
    this.pagePrefsConfig = p.pagePrefsConfig;
    this.selectedValsByPrefId = p.selectedValsByPrefId || {};
    this.ifFunctionsByRef = {};

    // Unminify conditional function data
    Object.keys(p.ifFunctionsByRef).forEach((ref) => {
      this.ifFunctionsByRef[ref] = expandClientFunction(
        p.ifFunctionsByRef[ref]
      ) as ClientFunction;
    });

    this.updateEditButton();
    this.locateChooserElement();

    const overrideApplied = this.applyPrefOverrides();
    if (overrideApplied) {
      this.rerender();
    } else {
      this.addChooserEventListeners();
    }

    this.revealPage();
    this.populateRightNav();

    this.syncUrlWithSelectedVals();
    this.updateStoredPreferences();
  }

  revealPage() {
    // reveal markdoc-chooser and markdoc-content by ID
    if (this.chooserElement) {
      this.chooserElement.style.position = 'sticky';
      this.chooserElement.style.top = '95px';
      this.chooserElement.style.backgroundColor = 'white';
      this.chooserElement.style.paddingTop = '10px';
      this.chooserElement.style.visibility = 'visible';
      this.chooserElement.style.zIndex = '1000';
    }

    const content = document.getElementById('markdoc-content');
    if (content) {
      content.style.visibility = 'visible';
    }
  }

  rerenderChooser() {
    if (!this.pagePrefsConfig || !this.prefOptionsConfig || !this.chooserElement) {
      throw new Error(
        'Cannot rerender chooser without pagePrefsConfig, prefOptionsConfig, and chooserElement'
      );
    }

    /**
     * Re-resolve the page prefs, since a newly selected value
     * can have a cascading impact on the interpolated placeholder values,
     * and thus the valid options for each preference.
     */
    const resolvedPagePrefs = resolveMinifiedPagePrefs({
      pagePrefsConfig: this.pagePrefsConfig,
      prefOptionsConfig: this.prefOptionsConfig!,
      valsByPrefId: this.selectedValsByPrefId
    });

    /**
     * Update the selected values to align with the resolved prefs,
     * in case any previously selected values
     * have become invalid and been overridden by defaults.
     */
    Object.keys(resolvedPagePrefs).forEach((resolvedPrefId) => {
      const resolvedPref = resolvedPagePrefs[resolvedPrefId];
      this.selectedValsByPrefId[resolvedPref.id] = resolvedPref.currentValue;
    });

    const newChooserHtml = getChooserHtml(resolvedPagePrefs);
    this.chooserElement.innerHTML = newChooserHtml;
    this.addChooserEventListeners();
  }
}
