import { Injectable } from '@angular/core';

import { WidgetLibraryService } from '../widgets/widget-library.service';

// No framework - unmodified controls, with styles from layout only
import { NoFrameworkComponent } from './no-framework.component';

// Material Design Framework (under construction)
// https://github.com/angular/material2
// https://www.muicss.com/docs/v1/css-js/forms
// http://materializecss.com/forms.html
import { MaterialDesignComponent } from './material-design/material-design.component';
import { MaterialAddReferenceComponent } from './material-design/material-add-reference.component';
import { MaterialButtonComponent } from './material-design/material-button.component';
import { MaterialCardComponent } from './material-design/material-card.component';
import { MaterialCheckboxComponent } from './material-design/material-checkbox.component';
import { MaterialCheckboxesComponent } from './material-design/material-checkboxes.component';
import { MaterialFileComponent } from './material-design/material-file.component';
import { MaterialInputComponent } from './material-design/material-input.component';
import { MaterialNumberComponent } from './material-design/material-number.component';
import { MaterialRadiosComponent } from './material-design/material-radios.component';
import { MaterialSelectComponent } from './material-design/material-select.component';
import { MaterialTabsComponent } from './material-design/material-tabs.component';
import { MaterialTextareaComponent } from './material-design/material-textarea.component';

// Bootstrap 3 Framework
// https://github.com/valor-software/ng2-bootstrap
import { Bootstrap3Component } from './bootstrap-3.component';

// Bootstrap 4 Framework (not started)
// https://github.com/ng-bootstrap/ng-bootstrap
// http://v4-alpha.getbootstrap.com/components/forms/
import { Bootstrap4Component } from './bootstrap-4.component';
// Foundation 6 Framework (not started)
// https://github.com/zurb/foundation-sites
import { Foundation6Component } from './foundation-6.component';
// Semantic UI Framework (not started)
// https://github.com/vladotesanovic/ngSemantic
import { SemanticUIComponent } from './semantic-ui.component';

export type Framework = {
  framework: any,
  widgets?: { [key: string]: any },
  stylesheets?: string[],
  scripts?: string[]
};

export type FrameworkLibrary = { [key: string]: Framework };

@Injectable()
export class FrameworkLibraryService {
  private defaultFramework: string = 'bootstrap-3';
  private frameworkLibrary: FrameworkLibrary = {
    'no-framework': { framework: NoFrameworkComponent },
    'material-design': {
      framework: MaterialDesignComponent,
      widgets: {
        '$ref': MaterialAddReferenceComponent,
        'number': MaterialNumberComponent,
        'text': MaterialInputComponent,
        'file': MaterialFileComponent,
        'checkbox': MaterialCheckboxComponent,
        'submit': 'button',
        'button': MaterialButtonComponent,
        'select': MaterialSelectComponent,
        'textarea': MaterialTextareaComponent,
        'checkboxes': MaterialCheckboxesComponent,
        'radios': MaterialRadiosComponent,
        'fieldset': MaterialCardComponent,
        'tabs': MaterialTabsComponent,
      },
      stylesheets: [
        // '//justindujardin.github.io/ng2-material/vendor/ng2-material/ng2-material.css',
        // '//justindujardin.github.io/ng2-material/vendor/ng2-material/font/font.css',
        // '//cdn.rawgit.com/urish/angular2-material-build/master/angular2_material.css',
        // '//cdn.rawgit.com/justindujardin/ng2-material/gh-pages/v/0.2.5/dist/ng2-material.css',
        // '//cdn.rawgit.com/justindujardin/ng2-material/gh-pages/v/0.2.5/dist/font.css',
        '//fonts.googleapis.com/icon?family=Material+Icons',
        '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        '//cdn.rawgit.com/justindujardin/ng2-material/gh-pages/v/0.2.8/ng2-material/all.css',
      ],
    },
    'bootstrap-3': {
      framework: Bootstrap3Component,
      stylesheets: [
        '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
        '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css',
      ],
      scripts: [
        // '//code.jquery.com/jquery-2.1.1.min.js',
        // '//code.jquery.com/ui/1.12.1/jquery-ui.min.js',
        '//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js',
        '//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
        '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
      ],
    },
    'bootstrap-4': { framework: Bootstrap4Component, },
    'foundation-6': { framework: Foundation6Component, },
    'smantic-ui': { framework: SemanticUIComponent, },
  };
  private activeFramework: Framework;
  private stylesheets: (HTMLStyleElement|HTMLLinkElement)[];
  private scripts: HTMLScriptElement[];

  constructor(
    private widgetLibrary: WidgetLibraryService
  ) {
    this.setFramework();
  }

  private registerFrameworkWidgets(framework: Framework): boolean {
    if (framework.hasOwnProperty('widgets')) {
      this.widgetLibrary.registerFrameworkWidgets(framework.widgets);
      return true;
    }
    this.widgetLibrary.unRegisterFrameworkWidgets();
    return false;
  }

  private loadFrameworkExternalAssets(framework: Framework): boolean {
    for (let node of [...(this.scripts || []), ...(this.stylesheets || [])]) {
      node.parentNode.removeChild(node);
    }
    this.scripts = [];
    this.stylesheets = [];
    if (framework.hasOwnProperty('scripts')) {
      for (let script of framework.scripts) {
        let newScript: HTMLScriptElement = document.createElement('script');
        if (script.slice(0, 1) === '/' || script.slice(0, 2) === './'
          || script.slice(0, 4) === 'http'
        ) { // Attach URL to remote javascript
          newScript.src = script;
        } else { // Attach content of given javascript
          newScript.innerHTML = script;
        }
        this.scripts.push(newScript);
        document.head.appendChild(newScript);
      }
    }
    if (framework.hasOwnProperty('stylesheets')) {
      for (let stylesheet of framework.stylesheets) {
        let newStylesheet: HTMLStyleElement|HTMLLinkElement;
        if (stylesheet.slice(0, 1) === '/' || stylesheet.slice(0, 2) === './'
          || stylesheet.slice(0, 4) === 'http'
        ) { // Attach URL to remote stylesheet
          newStylesheet = document.createElement('link');
          (<HTMLLinkElement>newStylesheet).rel = 'stylesheet';
          (<HTMLLinkElement>newStylesheet).href = stylesheet;
        } else { // Attach content of given stylesheet
          newStylesheet = document.createElement('style');
          newStylesheet.innerHTML = stylesheet;
        }
        this.stylesheets.push(newStylesheet);
        document.head.appendChild(newStylesheet);
      }
    }
    return !!(framework.stylesheets || framework.scripts);
  }

  public setFramework(framework?: string|Framework): boolean {
    let activeFramework: Framework = null;
    if (!framework || framework === 'default') {
      activeFramework = this.frameworkLibrary[this.defaultFramework];
    } else if (typeof framework === 'string' && this.hasFramework(framework)) {
      activeFramework = this.frameworkLibrary[framework];
    } else if (typeof framework === 'object' && framework.hasOwnProperty('framework')) {
      activeFramework = framework;
    }
    if (activeFramework) {
      this.activeFramework = activeFramework;
      this.registerFrameworkWidgets(this.activeFramework);
      this.loadFrameworkExternalAssets(this.activeFramework);
      return true;
    }
    return false;
  }

  public hasFramework(type: string): boolean {
    if (!type || typeof type !== 'string') return false;
    return this.frameworkLibrary.hasOwnProperty(type);
  }

  public getFramework(): any {
    return this.activeFramework.framework;
  }

  public getFrameworkWidgets(): any {
    return this.activeFramework.widgets || { };
  }

  public getFrameworkStylesheets(): string[] {
    return this.activeFramework.stylesheets || [];
  }

  public getFrameworkScritps(): string[] {
    return this.activeFramework.scripts || [];
  }
}
