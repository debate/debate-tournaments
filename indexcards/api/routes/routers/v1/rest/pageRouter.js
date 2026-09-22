import { Router } from 'express';
import * as controller from '../../../../controllers/rest/pageController.js';
import { z } from 'zod';
import { WebpageSchema } from '@tabroom/types';

const router = Router();

router.route('/').get(controller.getPublicPages).openapi = {
	list: {
		summary: 'Get Public Pages',
		description: 'Retrieve a list of public, sitewide pages',
		tags: ['Webpages'],
		security: [],
		responses: {
			200: {
				description: 'List of public webpages',
				content: {
					'application/json': {
						schema: z.array(WebpageSchema)
					},
				},
			},
			404: {
				$ref: '#/components/responses/NotFound',
			},
		},
	},
};

router.route('/:slug').get(controller.getPublicPages).openapi = {
	get: {
		summary: 'Get Public Page By Slug',
		description: "Retrieve a public, sitewide page by it's slug",
		tags: ['Webpages'],
		security: [],
		responses: {
			200: {
				description: 'A public webpages',
				content: {
					'application/json': {
						schema: WebpageSchema,
					},
				},
			},
			404: {
				$ref: '#/components/responses/NotFound',
			},
		},
	},
};

export default router;
