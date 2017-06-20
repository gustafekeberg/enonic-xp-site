'use strict';
/// <reference path="../../lib/xp/global.ts" />
import { PageController } from '../../lib/xp/page/controller';

const name = 'landing-page';
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
		this.model.lang = this.content.language;
		this.model.title = this.siteConfig.siteName;
		this.model.displayName = this.content.displayName;
		this.model.watch = this.request.port == 8889;
		return super.get();
	}

	public static handleRequest(request: any) {
		return new PagePageController(request).buildResponse().response;
	}

} // PagePageController

export const get = PagePageController.handleRequest;
