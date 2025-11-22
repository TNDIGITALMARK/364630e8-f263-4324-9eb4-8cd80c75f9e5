/**
 * Phoenix Context Integration
 *
 * Handles adding tracked components to chat context via hover button
 * Communicates with parent via postMessage pattern
 */

(() => {
  'use strict';

  const DEBUG = true;
  const PARENT_ORIGIN = '*';

  function log(...args) {
    if (DEBUG) console.log('[ContextIntegration]', ...args);
  }

  class PhoenixContextIntegration {
    constructor() {
      this.addedElements = new Set();
      this.pendingRequests = new Map();
      this.setupMessageListener();

      log('Initialized');
    }

    /**
     * Add component to chat context
     */
    async addToChat(phoenixId, trackingData) {
      log('Adding to chat context:', phoenixId);

      // Prevent duplicate additions
      if (this.addedElements.has(phoenixId)) {
        log('Already added to context:', phoenixId);
        return { success: false, reason: 'already-added' };
      }

      // Show optimistic feedback
      this.showAddingFeedback(phoenixId);

      try {
        // Create comprehensive payload for parent
        const payload = {
          type: 'phoenix-add-to-context',
          phoenixId,
          componentData: {
            id: `context-${phoenixId}-${Date.now()}`,
            displayName: this.generateDisplayName(trackingData),
            description: this.generateDescription(trackingData),
            category: this.categorizeComponent(trackingData),
            phoenixElement: trackingData,
            selectedAt: new Date(),
            selectionMode: 'context-button',
            boundingRect: trackingData.boundingRect
          },
          timestamp: Date.now()
        };

        // Send to parent and wait for response
        const response = await this.sendToParent(payload);

        if (response.success) {
          this.confirmAdded(phoenixId);
          this.addedElements.add(phoenixId);
          log('✅ Successfully added to context:', phoenixId);
          return { success: true };
        } else {
          this.rollbackAdded(phoenixId);
          log('❌ Failed to add to context:', response.error);
          return { success: false, error: response.error };
        }
      } catch (error) {
        log('❌ Error adding to context:', error);
        this.rollbackAdded(phoenixId);
        return { success: false, error: error.message };
      }
    }

    /**
     * Send message to parent and wait for response
     */
    sendToParent(payload) {
      return new Promise((resolve) => {
        const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Store resolver
        this.pendingRequests.set(requestId, resolve);

        // Send with request ID
        window.parent.postMessage({
          ...payload,
          requestId
        }, PARENT_ORIGIN);

        log('Sent to parent:', payload.type, requestId);

        // Timeout fallback (5 seconds)
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            resolve({ success: false, error: 'timeout' });
            log('Request timeout:', requestId);
          }
        }, 5000);
      });
    }

    /**
     * Setup message listener for parent responses
     */
    setupMessageListener() {
      window.addEventListener('message', (event) => {
        const { type, requestId, success, error } = event.data || {};

        if (type === 'phoenix-add-to-context-response' && requestId) {
          const resolver = this.pendingRequests.get(requestId);
          if (resolver) {
            this.pendingRequests.delete(requestId);
            resolver({ success, error });
            log('Received response:', requestId, success);
          }
        }
      });
    }

    /**
     * Show visual feedback that element is being added
     */
    showAddingFeedback(phoenixId) {
      const element = document.querySelector(`[data-phoenix-id="${phoenixId}"]`);
      if (!element) return;

      element.setAttribute('data-context-adding', 'true');

      // Add subtle pulse animation
      const originalTransition = element.style.transition;
      element.style.transition = 'all 0.3s ease-out';
      element.style.transform = 'scale(0.98)';

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        setTimeout(() => {
          element.style.transition = originalTransition;
        }, 300);
      }, 100);
    }

    /**
     * Confirm element was added successfully
     */
    confirmAdded(phoenixId) {
      const element = document.querySelector(`[data-phoenix-id="${phoenixId}"]`);
      if (!element) return;

      element.removeAttribute('data-context-adding');
      element.setAttribute('data-context-added', 'true');

      // Show checkmark indicator briefly
      this.showCheckmark(element);
    }

    /**
     * Rollback if addition failed
     */
    rollbackAdded(phoenixId) {
      const element = document.querySelector(`[data-phoenix-id="${phoenixId}"]`);
      if (!element) return;

      element.removeAttribute('data-context-adding');

      // Show error indicator briefly
      this.showErrorIndicator(element);
    }

    /**
     * Show subtle success feedback
     */
    showCheckmark(element) {
      // Minimal feedback - just a subtle flash
      const originalOpacity = element.style.opacity;
      element.style.transition = 'opacity 0.15s ease';
      element.style.opacity = '0.6';

      setTimeout(() => {
        element.style.opacity = originalOpacity || '1';
      }, 150);
    }

    /**
     * Show subtle error feedback
     */
    showErrorIndicator(element) {
      // Minimal feedback - just a subtle shake
      const originalTransform = element.style.transform;
      element.style.transition = 'transform 0.1s ease';

      element.style.transform = 'translateX(-4px)';
      setTimeout(() => {
        element.style.transform = 'translateX(4px)';
        setTimeout(() => {
          element.style.transform = 'translateX(-2px)';
          setTimeout(() => {
            element.style.transform = 'translateX(2px)';
            setTimeout(() => {
              element.style.transform = originalTransform || 'translateX(0)';
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    }

    /**
     * Check if element is already in context
     */
    isInContext(phoenixId) {
      return this.addedElements.has(phoenixId);
    }

    /**
     * Remove element from context tracking
     */
    removeFromContext(phoenixId) {
      this.addedElements.delete(phoenixId);

      const element = document.querySelector(`[data-phoenix-id="${phoenixId}"]`);
      if (element) {
        element.removeAttribute('data-context-added');
      }
    }

    /**
     * Clear all context tracking
     */
    clearAll() {
      this.addedElements.clear();
      document.querySelectorAll('[data-context-added]').forEach(el => {
        el.removeAttribute('data-context-added');
      });
      log('Cleared all context tracking');
    }

    // Utility functions for component metadata
    generateDisplayName(trackingData) {
      const { componentName, tagName, textContent, attributes } = trackingData;

      if (componentName && componentName !== tagName) {
        return componentName.replace(/([A-Z])/g, ' $1').trim();
      }

      const tag = tagName.toLowerCase();

      if (tag === 'button' && textContent) {
        const text = textContent.trim().slice(0, 20);
        return text ? `"${text}" button` : 'Button';
      }

      if (tag === 'a' && textContent) {
        const text = textContent.trim().slice(0, 20);
        return text ? `"${text}" link` : 'Link';
      }

      if (tag === 'input') {
        const type = attributes?.type || 'text';
        return `${type.charAt(0).toUpperCase() + type.slice(1)} input`;
      }

      return tagName.charAt(0).toUpperCase() + tagName.slice(1);
    }

    generateDescription(trackingData) {
      const parts = [];

      if (trackingData.textContent && trackingData.textContent.trim()) {
        const text = trackingData.textContent.trim().slice(0, 50);
        parts.push(`"${text}${trackingData.textContent.length > 50 ? '...' : ''}"`);
      }

      parts.push(`${trackingData.tagName} element`);

      if (trackingData.className) {
        const classes = trackingData.className.split(' ').slice(0, 2).join(' ');
        parts.push(`(${classes})`);
      }

      return parts.join(' ');
    }

    categorizeComponent(trackingData) {
      const { tagName, isInteractive, className } = trackingData;
      const tag = tagName.toLowerCase();
      const classLower = className?.toLowerCase() || '';

      if (tag === 'form' || ['input', 'textarea', 'select'].includes(tag)) {
        return 'form';
      }

      if (tag === 'nav' || classLower.includes('nav')) {
        return 'navigation';
      }

      if (['header', 'footer', 'aside', 'main'].includes(tag)) {
        return 'layout';
      }

      if (isInteractive || tag === 'button' || tag === 'a') {
        return 'ui';
      }

      return 'other';
    }
  }

  // Create global instance
  window.__phoenixContextIntegration = new PhoenixContextIntegration();

  // Notify parent that context integration is ready
  window.parent.postMessage({
    type: 'phoenix-context-integration-ready',
    timestamp: Date.now()
  }, PARENT_ORIGIN);

  log('✅ Context Integration loaded and ready');

  // Add minimal CSS for context indicators
  const style = document.createElement('style');
  style.textContent = `
    [data-context-adding] {
      opacity: 0.7 !important;
      transition: opacity 0.2s ease !important;
    }

    [data-context-added] {
      position: relative !important;
    }

    [data-context-added]::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      border: 1.5px solid white;
      z-index: 999998;
      pointer-events: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
  `;
  document.head.appendChild(style);

})();
