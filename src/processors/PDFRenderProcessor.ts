const portfinder = require('portfinder');
import * as httpServer from 'http-server';
import { Server } from 'http';
import { launch, PDFOptions } from 'puppeteer';
import { ActionSnapshot } from 'fbl';

export class PDFRenderProcessor {
    private server: Server;
    private port: number;

    constructor(
        private targetFolder: string,
        private relativePath: string,
        private pdfOptions: PDFOptions,
        private snapshot: ActionSnapshot,
    ) {}

    public async run(): Promise<void> {
        await this.startServer();
        await this.render();
        await this.closeServer();
    }

    private async render(): Promise<void> {
        this.snapshot.log('-> launching browser');
        const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        this.snapshot.log('-> openning new page');
        const page = await browser.newPage();
        this.snapshot.log(`-> navigating to: http://localhost:${this.port}/${this.relativePath}`);
        await page.goto(`http://localhost:${this.port}/${this.relativePath}`, { waitUntil: 'networkidle2' });
        this.snapshot.log('-> rendering pdf');
        await page.pdf(this.pdfOptions);
        this.snapshot.log('-> closing browser');
        await browser.close();
        this.snapshot.log('<- browser closed');
    }

    private async startServer(): Promise<void> {
        const port = (this.port = await portfinder.getPortPromise());

        const server = (this.server = httpServer.createServer({
            root: this.targetFolder,
        }));

        this.snapshot.log(`-> starting server on port: ${port}`);
        await new Promise<void>((res, rej) => {
            server.listen(port, res);
        });
        this.snapshot.log('<- server started');
    }

    private async closeServer(): Promise<void> {
        this.snapshot.log('-> closing server');
        this.server.close();
        this.snapshot.log('<- server closed');
    }
}
