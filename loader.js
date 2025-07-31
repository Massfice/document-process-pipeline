import fs from 'fs';
import path from 'path';

export function resolve(
    specifier,
    context,
    defaultResolve,
) {
    if (
        !specifier.startsWith('.') ||
        specifier.endsWith('.js') ||
        specifier.endsWith('.mjs') ||
        specifier.endsWith('.cjs')
    ) {
        return defaultResolve(
            specifier,
            context,
            defaultResolve,
        );
    }

    const dirname = path.dirname(
        context.parentURL.replace('file://', ''),
    );

    const modPath = path.join(dirname, specifier);

    const isDir =
        fs.existsSync(modPath) &&
        fs.statSync(modPath).isDirectory();

    const extension = isDir ? '/index.js' : '.js';

    return defaultResolve(
        specifier + extension,
        context,
        defaultResolve,
    );
}
