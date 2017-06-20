'use strict';
/// <reference path="./global.d.ts" />
// Importing gradle dependencies via TS or ES2015 gives:
// error TS2307: Cannot find module 'xp/thymeleaf'
// So going old school:
const libs = {
    xp: {
        portal:    require('xp/portal'),
        thymeleaf: require('xp/thymeleaf')
    }
};
const xpPortalGetComponent  = libs.xp.portal.getComponent;
const xpPortalGetContent    = libs.xp.portal.getContent;
const xpPortalGetSiteConfig = libs.xp.portal.getSiteConfig;
const xpThymeleafRender     = libs.xp.thymeleaf.render;

export abstract class Controller {
    body: string;
    component: any;
    config: any;
    content: any;
    cookies: any;
    headers: any;
    method: string;
    mode: string;
    model: any;
    name: string;
    params: any;
    request: any;
    response: any;
    responseContentType: string;
    siteConfig: any;
    status: number;
    type: string;
    viewFile: string; // resolved path

    constructor(request: any) {
        log.debug(`Controller.constructor`);
        this.request = request;
        this.cookies = request.cookies;
        this.headers = request.headers;
        this.method  = request.method;
        this.mode    = request.mode;
        this.params  = request.params;

        this.content   = xpPortalGetContent(); // Some pages, layouts and parts may not require content...
        this.component = xpPortalGetComponent() || this.content.page;
        this.config    = this.component.config;

        this.siteConfig = xpPortalGetSiteConfig();
        this.model = {};
    } // constructor

    debug() {
        log.info(`${this.name} ${this.type} config:${JSON.stringify(this.config, null, 4)}`);
        log.info(`${this.name} ${this.type} model:${JSON.stringify(this.model, null, 4)}`);
        return this; // chainable
    }
    /*
    log.info(`${this.name} ${this.type} controller:${JSON.stringify(this, null, 4)}`); // Everything can be too much :)
    log.info(`${this.name} ${this.type} content:${JSON.stringify(this.content, null, 4)}`);
    log.info(`${this.name} ${this.type} request:${JSON.stringify(this.request, null, 4)}`);
    log.info(`${this.name} ${this.type} siteConfig:${JSON.stringify(this.siteConfig, null, 4)}`);
    log.info(`${this.name} ${this.type} component:${JSON.stringify(this.component, null, 4)}`);
    log.info(`${this.name} ${this.type} response:${JSON.stringify(this.response, null, 4)}`);
    */

    render() {
        log.debug(`Controller.render()`);
        //log.info(`viewFile:${this.viewFile}`);
        //log.info(`model:${JSON.stringify(this.model, null, 4)}`);
        this.body = xpThymeleafRender(this.viewFile, this.model);
        //log.info(`body:${JSON.stringify(this.body, null, 4)}`);
        return this; // chainable
    }

    get(): any {
        log.debug(`Controller.get()`);
        this.model.name = this.name;
        return this; // chainable
    }

    buildResponse() {
        log.debug(`Controller.buildResponse()`);
        switch (this.method) { case 'GET': this.get(); break; }
        this.render();
        this.responseContentType = 'text/html';
        this.status = 200;
        this.response = {
            body:   this.body,
            contentType: this.responseContentType,
            status: this.status
        };
        this.debug();
        return this; // chainable
    }

    public static handleRequest(request: any): any {}

} // abstract class Controller



export abstract class ControllerWithRegions extends Controller {
    regions: any;
    //regionsArray: array;

    constructor(request) {
        super(request);
        this.regions = this.component.regions;
        this.model.regions = this.regions;
        this.model.regionsArray = Object.keys(this.regions).map(k=>this.regions[k]);
        //log.info(`${this.name} ${this.type} this.model.regions:${JSON.stringify(this.model.regions, null, 4)}`);
    }

    debug() {
        super.debug();
        //log.info(`${this.name} ${this.type} regions:${JSON.stringify(this.regions, null, 4)}`);
        return this; // chainable
    }

} // abstract class ControllerWithRegions
