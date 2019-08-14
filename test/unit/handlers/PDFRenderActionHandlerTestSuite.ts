import { suite, test } from 'mocha-typescript';
import { Container } from 'typedi';
import { PDFRenderProcessor } from '../../../src/processors';
import { promisify } from 'util';
import { readFile } from 'fs';
import { TempPathsRegistry, ContextUtil, ActionSnapshot } from 'fbl';
import { strictEqual } from 'assert';
import { PDFRenderActionHandler } from '../../../src/handlers';

const pdfParse = require('pdf-parse');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
class PDFRenderActionHandlerTestSuite {
    async after(): Promise<void> {
        const tempPathRegistry = Container.get(TempPathsRegistry);
        await tempPathRegistry.cleanup();

        Container.reset();
    }

    @test()
    async failValidation() {
        const actionHandler = new PDFRenderActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        await chai.expect(actionHandler.getProcessor([], context, snapshot, {}).validate()).to.be.rejected;
        await chai.expect(actionHandler.getProcessor({}, context, snapshot, {}).validate()).to.be.rejected;
        await chai.expect(actionHandler.getProcessor('yes', context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        from: {},
                        pdf: {},
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        from: {},
                        pdf: {},
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        from: {
                            folder: '',
                        },
                        pdf: {},
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        from: {
                            folder: '',
                            relativePath: 'index.html',
                        },
                        pdf: {},
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        from: {
                            folder: '',
                            relativePath: 'index.html',
                        },
                        pdf: {},
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;
    }

    @test()
    async passValidation() {
        const actionHandler = new PDFRenderActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        await actionHandler
            .getProcessor(
                {
                    from: {
                        folder: 'test',
                        relativePath: 'index.html',
                    },
                    pdf: {
                        path: 'test.pdf',
                    },
                },
                context,
                snapshot,
                {},
            )
            .validate();
    }

    @test()
    async generatePdfFile() {
        const tempPathRegistry = Container.get(TempPathsRegistry);
        const pdfPath = await tempPathRegistry.createTempFile();

        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('id', {}, process.cwd(), 0, {});

        const actionHandler = new PDFRenderActionHandler();
        const processor = actionHandler.getProcessor(
            {
                from: {
                    folder: 'test/assets',
                    relativePath: 'index.html',
                },
                pdf: {
                    path: pdfPath,
                    format: 'A4',
                },
            },
            context,
            snapshot,
            {},
        );

        await processor.validate();
        await processor.execute();

        const readFileAsync = promisify(readFile);
        const pdfContents = await readFileAsync(pdfPath);

        const pdfData = await pdfParse(pdfContents);
        strictEqual(pdfData.text.trim().indexOf('Hello'), 0);
    }

    @test()
    async generatePDFWithTimeout() {
        const tempPathRegistry = Container.get(TempPathsRegistry);
        const pdfPath = await tempPathRegistry.createTempFile();

        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('id', {}, process.cwd(), 0, {});

        const actionHandler = new PDFRenderActionHandler();
        const processor = actionHandler.getProcessor(
            {
                timeout: 5,
                readyFunction: 'readyFunction',
                from: {
                    folder: 'test/assets',
                    relativePath: 'index.html',
                },
                pdf: {
                    path: pdfPath,
                    format: 'A4',
                },
            },
            context,
            snapshot,
            {},
        );

        await processor.validate();

        await chai.expect(processor.execute()).to.be.rejectedWith('Timeout waiting for ready function call');
    }

    @test()
    async generatePDFWithReadyFunctionSetting() {
        const tempPathRegistry = Container.get(TempPathsRegistry);
        const pdfPath = await tempPathRegistry.createTempFile();

        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('id', {}, process.cwd(), 0, {});

        const actionHandler = new PDFRenderActionHandler();
        const processor = actionHandler.getProcessor(
            {
                timeout: 5,
                readyFunction: 'iAmReady',
                from: {
                    folder: 'test/assets',
                    relativePath: 'readyFn.html',
                },
                pdf: {
                    path: pdfPath,
                    format: 'A4',
                },
            },
            context,
            snapshot,
            {},
        );

        await processor.validate();
        await processor.execute();

        const readFileAsync = promisify(readFile);
        const pdfContents = await readFileAsync(pdfPath);

        const pdfData = await pdfParse(pdfContents);
        strictEqual(pdfData.text.trim().indexOf('Hello'), 0);
    }
}
