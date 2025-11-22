/**
 * Phoenix Inline Class Editor
 *
 * Provides inline editing of className attributes with optimistic updates
 * Similar to inlineTextEditor but specialized for Tailwind/CSS classes
 */

(() => {
  'use strict';

  const DEBUG = true;

  function log(...args) {
    if (DEBUG) console.log('[InlineClassEditor]', ...args);
  }

  class InlineClassEditor {
    constructor() {
      this.isEditing = false;
      this.activeEditor = null;
      this.originalElement = null;
      this.originalClasses = '';
      this.editorHandlers = null;

      log('Initialized');
    }

    /**
     * Check if element has editable classes
     */
    hasEditableClasses(element) {
      if (!element || !element.getAttribute) return false;

      // Check if element has a className attribute or class attribute
      return element.hasAttribute('class') || element.className !== undefined;
    }

    /**
     * Start editing classes
     */
    startEdit(element) {
      if (this.isEditing) {
        log('Already editing, canceling current edit first');
        this.cancelEdit();
      }

      if (!element || !this.hasEditableClasses(element)) {
        log('Element not editable');
        return false;
      }

      this.originalElement = element;
      this.originalClasses = element.className || '';
      this.isEditing = true;

      log('Starting class edit:', {
        phoenixId: element.getAttribute('data-phoenix-id'),
        originalClasses: this.originalClasses
      });

      // Create and show editor
      this.createEditor(element);

      return true;
    }

    /**
     * Create the inline editor UI
     */
    createEditor(element) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Create editor container
      const editorContainer = document.createElement('div');
      editorContainer.className = '__phoenix-class-editor-container';

      // Create input field
      const input = document.createElement('input');
      input.type = 'text';
      input.className = '__phoenix-class-editor-input';
      input.value = this.originalClasses;
      input.placeholder = 'Enter class names...';

      // Create helper text
      const helperText = document.createElement('div');
      helperText.className = '__phoenix-class-editor-helper';
      helperText.textContent = 'Press Enter to save, Esc to cancel';

      // Position container near element
      editorContainer.style.cssText = `
        position: fixed !important;
        top: ${rect.bottom + 8}px !important;
        left: ${rect.left}px !important;
        min-width: ${Math.max(rect.width, 300)}px !important;
        z-index: 999999 !important;
        background: white !important;
        border: 2px solid #3b82f6 !important;
        border-radius: 8px !important;
        padding: 12px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
      `;

      input.style.cssText = `
        width: 100% !important;
        padding: 8px 12px !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
        outline: none !important;
        margin-bottom: 8px !important;
      `;

      helperText.style.cssText = `
        font-size: 11px !important;
        color: #6b7280 !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      `;

      // Add highlight to original element
      element.style.outline = '2px solid #3b82f6';
      element.style.outlineOffset = '2px';

      // Assemble editor
      editorContainer.appendChild(input);
      editorContainer.appendChild(helperText);
      document.body.appendChild(editorContainer);

      this.activeEditor = editorContainer;

      // Focus input and select all
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });

      // Setup event handlers
      this.setupEventHandlers(input, element);
    }

    /**
     * Setup event handlers for editor
     */
    setupEventHandlers(input, element) {
      const keydownHandler = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          this.commitEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this.cancelEdit();
        }
      };

      const blurHandler = (e) => {
        // Small delay to allow clicking helper text
        setTimeout(() => {
          if (this.isEditing) {
            this.commitEdit();
          }
        }, 150);
      };

      input.addEventListener('keydown', keydownHandler);
      input.addEventListener('blur', blurHandler);

      // Store handlers for cleanup
      this.editorHandlers = { keydownHandler, blurHandler, input };
    }

    /**
     * Commit the edit (save changes)
     */
    async commitEdit() {
      if (!this.isEditing || !this.activeEditor || !this.originalElement) {
        return;
      }

      const input = this.editorHandlers.input;
      const newClasses = input.value.trim();
      const phoenixId = this.originalElement.getAttribute('data-phoenix-id');

      log('Committing class edit:', { phoenixId, originalClasses: this.originalClasses, newClasses });

      // Check if classes actually changed
      if (newClasses === this.originalClasses.trim()) {
        log('No changes detected, canceling');
        this.cancelEdit();
        return;
      }

      // Get source location from stamped attributes
      const filePath = this.originalElement.getAttribute('data-phoenix-source');
      const lineNumber = this.originalElement.getAttribute('data-phoenix-line')
        ? parseInt(this.originalElement.getAttribute('data-phoenix-line'), 10)
        : undefined;
      const columnNumber = this.originalElement.getAttribute('data-phoenix-col')
        ? parseInt(this.originalElement.getAttribute('data-phoenix-col'), 10)
        : undefined;

      const elementTag = this.originalElement.tagName.toLowerCase();

      log('📍 Source location from stamped attributes:', { filePath, lineNumber, columnNumber });

      // Use visualEditExtension's optimistic update system
      if (window.__phoenixVisualEditor) {
        try {
          const success = await window.__phoenixVisualEditor.handleVisualEdit(
            phoenixId,
            'className',
            newClasses
          );

          if (success) {
            log('✅ Class edit successful - sending AST request to parent');

            // Send postMessage to parent for AST persistence
            try {
              const astEditMessage = {
                type: 'phoenix-class-edit',
                requestId: `class-edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                phoenixId: phoenixId,
                data: {
                  phoenixId: phoenixId,
                  filePath: filePath || './src/app/page.tsx',
                  lineNumber: lineNumber,
                  columnNumber: columnNumber,
                  oldClasses: this.originalClasses,
                  newClasses: newClasses,
                  elementTag: elementTag,
                  operationType: 'class-edit'
                }
              };

              log('📤 Sending AST edit message to parent:', astEditMessage);
              window.parent.postMessage(astEditMessage, '*');
              log('✅ AST request sent successfully');
            } catch (astError) {
              log('❌ Error sending AST request:', astError);
              // Don't fail the edit if AST request fails
            }
          } else {
            log('❌ Class edit failed - reverted');
          }
        } catch (error) {
          log('❌ Error during class edit:', error);
        }
      } else {
        log('❌ Visual editor not available, applying change directly');
        this.originalElement.className = newClasses;
      }

      // Clean up editor UI
      this.cleanupEditor();
    }

    /**
     * Cancel the edit (discard changes)
     */
    cancelEdit() {
      log('Canceling class edit');
      this.cleanupEditor();
    }

    /**
     * Clean up editor UI and state
     */
    cleanupEditor() {
      // Remove event handlers
      if (this.editorHandlers) {
        const { input, keydownHandler, blurHandler } = this.editorHandlers;
        input.removeEventListener('keydown', keydownHandler);
        input.removeEventListener('blur', blurHandler);
        this.editorHandlers = null;
      }

      // Remove editor from DOM
      if (this.activeEditor) {
        this.activeEditor.remove();
        this.activeEditor = null;
      }

      // Remove highlight from original element
      if (this.originalElement) {
        this.originalElement.style.outline = '';
        this.originalElement.style.outlineOffset = '';
        this.originalElement = null;
      }

      this.isEditing = false;
      this.originalClasses = '';

      log('Editor cleaned up');
    }

    /**
     * Check if currently editing
     */
    isActive() {
      return this.isEditing;
    }
  }

  // Create global instance
  window.__phoenixInlineClassEditor = new InlineClassEditor();

  log('✅ Inline Class Editor loaded and ready');

})();
