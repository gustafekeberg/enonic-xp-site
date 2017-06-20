'use strict';
/// <reference path="../../lib/xp/global.ts" />
import { PageController } from '../../lib/xp/page/controller';

const name = 'page';
const type = 'page';
const viewFile = resolve(`${name}.html`);
//const viewFile = `./${name}.html`;

export default class PagePageController extends PageController {

    constructor(request: any) {
        super(request);
        this.name = name;
        this.type = type;
        this.viewFile = viewFile;
    }

    get() {
        this.model.lang = 'nb-no';
        this.model.title = 'Title - test';
        this.model.watch = this.request.port == 8889;
        return super.get();
    }

    public static handleRequest(request: any) {
        return new PagePageController(request).buildResponse().response;
    }

} // PagePageController

export const get = PagePageController.handleRequest;
