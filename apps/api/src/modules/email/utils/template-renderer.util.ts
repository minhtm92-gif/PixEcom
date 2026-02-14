import { Injectable } from '@nestjs/common';

/**
 * Template variable substitution utility
 * Replaces {{variableName}} placeholders with actual values
 */
@Injectable()
export class TemplateRendererUtil {
  /**
   * Renders a template string by replacing variables
   * @param template Template string with {{variable}} placeholders
   * @param data Object containing variable values
   * @returns Rendered string with variables replaced
   */
  render(template: string, data: Record<string, any>): string {
    if (!template) return '';

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const trimmedPath = path.trim();
      const value = this.getNestedValue(data, trimmedPath);

      // Return empty string if value is null or undefined
      if (value === null || value === undefined) {
        return '';
      }

      // HTML escape the value for security
      return this.escapeHtml(String(value));
    });
  }

  /**
   * Renders a template without HTML escaping (for pre-sanitized HTML content)
   * @param template Template string with {{variable}} placeholders
   * @param data Object containing variable values
   * @returns Rendered string with variables replaced
   */
  renderUnsafe(template: string, data: Record<string, any>): string {
    if (!template) return '';

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const trimmedPath = path.trim();
      const value = this.getNestedValue(data, trimmedPath);

      if (value === null || value === undefined) {
        return '';
      }

      return String(value);
    });
  }

  /**
   * Gets nested property value using dot notation
   * @param obj Object to get value from
   * @param path Dot-separated path (e.g., 'customer.name')
   * @returns Value at the path or undefined
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  /**
   * Formats currency for email templates
   * @param amount Amount in decimal
   * @param currency Currency code (e.g., 'USD')
   * @returns Formatted currency string
   */
  formatCurrency(amount: number | string, currency: string = 'USD'): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numericAmount);
  }

  /**
   * Formats date for email templates
   * @param date Date to format
   * @returns Formatted date string
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  /**
   * Renders order items as HTML for email templates
   * @param items Array of order items
   * @returns HTML string with formatted items
   */
  renderOrderItems(items: any[]): string {
    if (!items || items.length === 0) {
      return '<p>No items</p>';
    }

    let html = '<table width="100%" cellpadding="10" style="border-collapse: collapse;">';
    html += '<thead><tr style="background-color: #f5f5f5;">';
    html += '<th align="left">Product</th>';
    html += '<th align="center">Qty</th>';
    html += '<th align="right">Price</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    for (const item of items) {
      html += '<tr style="border-bottom: 1px solid #e0e0e0;">';
      html += `<td>${this.escapeHtml(item.productName)}`;
      if (item.variantName) {
        html += ` <span style="color: #666;">(${this.escapeHtml(item.variantName)})</span>`;
      }
      html += '</td>';
      html += `<td align="center">${item.quantity}</td>`;
      html += `<td align="right">${this.formatCurrency(item.lineTotal, item.currency || 'USD')}</td>`;
      html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
  }

  /**
   * Renders cart items as HTML for email templates
   * @param items Array of cart items with variant and product info
   * @returns HTML string with formatted items
   */
  renderCartItems(items: any[]): string {
    if (!items || items.length === 0) {
      return '<p>Your cart is empty</p>';
    }

    let html = '<table width="100%" cellpadding="10" style="border-collapse: collapse;">';
    html += '<thead><tr style="background-color: #f5f5f5;">';
    html += '<th align="left">Product</th>';
    html += '<th align="center">Qty</th>';
    html += '<th align="right">Price</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    for (const item of items) {
      const product = item.variant?.product;
      const variant = item.variant;

      if (!product) continue;

      const price = variant?.priceOverride || product.basePrice || 0;
      const lineTotal = Number(price) * item.quantity;

      html += '<tr style="border-bottom: 1px solid #e0e0e0;">';
      html += `<td>${this.escapeHtml(product.name)}`;
      if (variant?.name) {
        html += ` <span style="color: #666;">(${this.escapeHtml(variant.name)})</span>`;
      }
      html += '</td>';
      html += `<td align="center">${item.quantity}</td>`;
      html += `<td align="right">${this.formatCurrency(lineTotal, product.currency || 'USD')}</td>`;
      html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
  }
}
