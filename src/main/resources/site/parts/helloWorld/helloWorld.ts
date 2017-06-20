'use strict';
/// <reference path="../../lib/xp/global.ts" />
import { PartController } from '../../lib/xp/part/controller';

const name = 'helloWorld';
const type = 'part';
const viewFile = resolve(`${name}.html`);

export default class ExamplePartController extends PartController {

    constructor(request: any) {
        super(request);
        this.name = name;
        this.type = type;
        this.viewFile = viewFile;
    }

    get() {
        this.model.helloWorld = this.config.helloWorld;
        return super.get();
    }

    public static handleRequest(request: any) {
        return new ExamplePartController(request).buildResponse().response;
    }

} // ExamplePartController

export const get = ExamplePartController.handleRequest;
