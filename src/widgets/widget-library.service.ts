import { Injectable } from '@angular/core';

import { AddReferenceComponent } from './add-reference.component';
import { ButtonComponent } from './button.component';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxesComponent } from './checkboxes.component';
import { FieldsetComponent } from './fieldset.component';
import { FileComponent } from './file.component';
import { HiddenComponent } from './hidden.component';
import { InputComponent } from './input.component';
import { MessageComponent } from './message.component';
import { NoneComponent } from './none.component';
import { NumberComponent } from './number.component';
import { RadiosComponent } from './radios.component';
import { RootComponent } from './root.component';
import { SectionComponent } from './section.component';
import { SelectComponent } from './select.component';
import { SelectFrameworkComponent } from './select-framework.component';
import { SelectWidgetComponent } from './select-widget.component';
import { SubmitComponent } from './submit.component';
import { TabComponent } from './tab.component';
import { TabsComponent } from './tabs.component';
import { TemplateComponent } from './template.component';
import { TextareaComponent } from './textarea.component';

import * as _ from 'lodash';

@Injectable()
export class WidgetLibraryService {

  private defaultWidget: string = 'none';
  private widgetLibrary: any = {

  // Angular 2 JSON Schema Form administrative widgets
    'none': NoneComponent, // Placeholder for development, displays nothing
    'root': RootComponent, // Form root, renders a complete layout
    'select-framework': SelectFrameworkComponent, // Applies the selected framework to a specified widget
    'select-widget': SelectWidgetComponent, // Displays a specified widget
    '$ref': AddReferenceComponent, // Button, adds new array item or $ref element

  // Free-form text HTML 'input' form control widgets <input type="...">
    'email': 'text',
    'integer': 'number', // Note: 'integer' is not an HTML 5 input type
    'number': NumberComponent,
    'password': 'text',
    'search': 'text',
    'tel': 'text',
    'text': InputComponent,
    'url': 'text',

  // Controlled text HTML 'input' form control widgets <input type="...">
    'color': 'text',
    'date': 'text',
    'datetime': 'text',
    'datetime-local': 'text',
    'month': 'text',
    'range': 'number',
    'time': 'text',
    'week': 'text',

  // Non-text HTML 'input' form control widgets <input type="...">
    // 'button': <input type="button"> not used, use <button> instead
    'checkbox': CheckboxComponent, // TODO: Set ternary = true for 3-state ??
    'file': FileComponent, // TODO: Figure out how to handle these
    'hidden': 'text',
    'image': 'text', // TODO: Figure out how to handle these
    'radio': 'radios',
    'reset': 'submit', // TODO: Figure out how to handle these
    'submit': SubmitComponent,

  // Other (non-'input') HTML form control widgets
    'button': ButtonComponent,
    'select': SelectComponent,
    // 'optgroup': automatically generated by select widgets (how?)
    // 'option': automatically generated by select widgets
    'textarea': TextareaComponent,

  // HTML form control widget sets
    'checkboxes': CheckboxesComponent, // Grouped list of checkboxes
    'checkboxes-inline': 'checkboxes', // Checkboxes in one line
    'checkboxbuttons': 'checkboxes', // Checkboxes as html buttons
    'radios': RadiosComponent, // Grouped list of radio buttons
    'radios-inline': 'radios', // Radio buttons in one line
    'radiobuttons': 'radios', // Radio control as html buttons

  // HTML Layout widgets
    // 'label': automatically added to data widgets
    'fieldset': FieldsetComponent, // A fieldset, with an optional legend
    // 'legend': automatically added to fieldsets

  // Non-HTML layout widgets
    'array': 'fieldset', // A list you can add, remove and reorder
    'tabarray': 'tabs', // A tabbed version of array
    'tab': 'fieldset', // A tab group, similar to a fieldset or section
    'tabs': TabsComponent, // A tabbed set of panels with different controls
    'help': MessageComponent, // Insert arbitrary html
    'message': MessageComponent, // Insert arbitrary html
    'msg': MessageComponent, // Insert arbitrary html
    'html': MessageComponent, // Insert arbitrary html
    'template': TemplateComponent, // Insert a custom Angular 2 component

  // Widgets included for compatibility with JSON Form API
    'advancedfieldset': 'fieldset', // Adds 'Advanced settings' title
    'authfieldset': 'fieldset', // Adds 'Authentication settings' title
    'optionfieldset': 'fieldset', // Option control, displays selected sub-item
    'selectfieldset': 'fieldset', // Select control, displays selected sub-item
    'section': SectionComponent, // Just a div
    'conditional': 'section', // Identical to 'section' (depeciated)
    'actions': 'section', // Horizontal button list, can only submit, uses buttons as items
    'tagsinput': 'section', // For entering short text tags
    // See: http://ulion.github.io/jsonform/playground/?example=fields-checkboxbuttons

  // Widgets included for compatibility with React JSON Schema Form API
    'updown': 'number',
    'date-time': 'text',
    'alt-datetime': 'text',
    'alt-date': 'text',

  // Widgets included for compatibility with Angular 2 Schema Form API
    'wizard': 'section', // Sequential panels with "Next" and "Previous" buttons

  // Recommended 3rd-party add-on widgets (TODO: add wrappers for these...)
    // 'ng2-select': Select control replacement - http://valor-software.com/ng2-select/
    // 'pikaday': Pikaday date picker - https://github.com/dbushell/Pikaday
    // 'spectrum': Spectrum color picker - http://bgrins.github.io/spectrum
    // 'bootstrap-slider': Bootstrap Slider range control - https://github.com/seiyria/bootstrap-slider
    // 'ace': ACE code editor - https://ace.c9.io
    // 'ckeditor': CKEditor HTML / rich text editor - http://ckeditor.com
    // 'tinymce': TinyMCE HTML / rich text editor - https://www.tinymce.com
    // 'imageselect': Bootstrap drop-down image selector - http://silviomoreto.github.io/bootstrap-select
    // 'wysihtml5': HTML editor - http://jhollingworth.github.io/bootstrap-wysihtml5
    // 'quill': Quill HTML / rich text editor (?) - https://quilljs.com
  };
  private registeredWidgets: any = { };
  private frameworkWidgets: any = { };
  private activeWidgets: any = { };

  constructor() {
    this.setActiveWidgets();
  }

  private setActiveWidgets() {
    this.activeWidgets = Object.assign(
      { }, this.widgetLibrary, this.frameworkWidgets, this.registeredWidgets
    );
    for (let widgetName of Object.keys(this.activeWidgets)) {
      let widget: any = this.activeWidgets[widgetName];
      // Resolve aliases
      if (typeof widget === 'string') {
        let usedAliases: string[] = [];
        while (typeof widget === 'string' && usedAliases.indexOf(widget) === -1) {
          usedAliases.push(widget);
          widget = this.activeWidgets[widget];
        }
        if (typeof widget !== 'string') {
          this.activeWidgets[widgetName] = widget;
        }
      }
    }
  }

  public setDefaultWidget(type: string): boolean {
    if (!this.hasWidget(type)) return false;
    this.defaultWidget = type;
    return true;
  }

  public hasWidget(type: string, widgetSet: string = 'activeWidgets'): boolean {
    if (!type || typeof type !== 'string') return false;
    return this[widgetSet].hasOwnProperty(type);
  }

  public hasDefaultWidget(type: string): boolean {
    return this.hasWidget(type, 'widgetLibrary');
  }

  public registerWidget(type: string, widget: any): boolean {
    if (!type || !widget || typeof type !== 'string') return false;
    this.registeredWidgets[type] = widget;
    this.setActiveWidgets();
    return true;
  }

  public unRegisterWidget(type: string): boolean {
    if (!type || typeof type !== 'string' ||
      !this.registeredWidgets.hasOwnProperty(type)) return false;
    delete this.registeredWidgets[type];
    this.setActiveWidgets();
    return true;
  }

  public unRegisterAllWidgets(unRegisterFrameworkWidgets: boolean = true): boolean {
    this.registeredWidgets = { };
    if (unRegisterFrameworkWidgets) this.frameworkWidgets = { };
    this.setActiveWidgets();
    return true;
  }

  public registerFrameworkWidgets(widgets: any): boolean {
    if (widgets === null || typeof widgets !== 'object') return false;
    this.frameworkWidgets = widgets;
    this.setActiveWidgets();
    return true;
  }

  public unRegisterFrameworkWidgets(): boolean {
    if (Object.keys(this.frameworkWidgets).length) {
      this.frameworkWidgets = { };
      this.setActiveWidgets();
    }
    return true;
  }

  public getWidget(type?: string, widgetSet: string = 'activeWidgets'): any {
    if (this.hasWidget(type, widgetSet)) return this[widgetSet][type];
    if (this.hasWidget(this.defaultWidget, widgetSet)) return this[widgetSet][this.defaultWidget];
    return null;
  }

  public getAllWidgets(): any {
    return {
      widgetLibrary: this.widgetLibrary,
      registeredWidgets: this.registeredWidgets,
      frameworkWidgets: this.frameworkWidgets,
      activeWidgets: this.activeWidgets,
    };
  }
}
