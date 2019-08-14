import {
    ActionHandler,
    ActionProcessor,
    ActionSnapshot,
    IActionHandlerMetadata,
    IDelegatedParameters,
    IContext,
    FSUtil,
} from 'fbl';

import * as Joi from 'joi';
import { PDFRenderProcessor } from '../processors';

export class PDFRenderActionProcessor extends ActionProcessor {
    private static schema = Joi.object()
        .keys({
            timeout: Joi.number()
                .min(1)
                .max(3600),

            readyFunction: Joi.string().min(1),

            from: Joi.object({
                folder: Joi.string()
                    .required()
                    .min(1),
                relativePath: Joi.string()
                    .required()
                    .min(1),
            }).required(),

            pdf: Joi.object({
                path: Joi.string()
                    .required()
                    .min(1),
                format: Joi.string().default('A4'),

                displayHeaderFooter: Joi.boolean(),
                headerTemplate: Joi.string(),
                footerTemplate: Joi.string(),
                printBackground: Joi.boolean(),
                landscape: Joi.boolean(),
                pageRanges: Joi.string().regex(/[0-9]+-[0-9]+/),

                width: Joi.alternatives(Joi.string(), Joi.number()),
                height: Joi.alternatives(Joi.string(), Joi.number()),

                margin: Joi.object({
                    top: Joi.alternatives(Joi.string(), Joi.number()),
                    right: Joi.alternatives(Joi.string(), Joi.number()),
                    bottom: Joi.alternatives(Joi.string(), Joi.number()),
                    left: Joi.alternatives(Joi.string(), Joi.number()),
                }),
                preferCSSPageSize: Joi.boolean(),
            }),
        })
        .required()
        .options({
            abortEarly: true,
            allowUnknown: false,
        });

    /**
     * @inheritdoc
     */
    getValidationSchema(): Joi.SchemaLike {
        return PDFRenderActionProcessor.schema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const to = JSON.parse(JSON.stringify(this.options.pdf));
        to.path = FSUtil.getAbsolutePath(to.path, this.snapshot.wd);

        const processor = new PDFRenderProcessor(
            FSUtil.getAbsolutePath(this.options.from.folder, this.snapshot.wd),
            this.options.from.relativePath,
            to,
            this.snapshot,
            {
                timeout: this.options.timeout,
                readyFunction: this.options.readyFunction,
            },
        );

        await processor.run();
    }
}

export class PDFRenderActionHandler extends ActionHandler {
    private static metadata = <IActionHandlerMetadata>{
        id: 'com.fireblink.fbl.plugins.html.to.pdf',
        aliases: ['fbl.plugins.html.to.pdf', 'html.to.pdf', 'html->pdf'],
    };

    /* istanbul ignore next */
    /**
     * @inheritdoc
     */
    getMetadata(): IActionHandlerMetadata {
        return PDFRenderActionHandler.metadata;
    }

    /**
     * @inheritdoc
     */
    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new PDFRenderActionProcessor(options, context, snapshot, parameters);
    }
}
