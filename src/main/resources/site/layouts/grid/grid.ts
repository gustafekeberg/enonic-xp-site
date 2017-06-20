'use strict';
/// <reference path="../../lib/xp/global.ts" />
import { LayoutController } from '../../lib/xp/layout/controller';

const name = 'grid';
const type = 'layout';
const viewFile = resolve(`${name}.html`);

export default class ExampleLayoutController extends LayoutController {

    constructor(request: any) {
        super(request);
        this.name = name;
        this.type = type;
        this.viewFile = viewFile;
    }

    get() {
        this.model.regions = Object.keys(this.regions).map(k=>this.regions[k]);
        return super.get();
    }

    public static handleRequest(request: any) {
        return new ExampleLayoutController(request).buildResponse().response;
    }

} // ExampleLayoutController

export const get = ExampleLayoutController.handleRequest;
