export function resolve(
    specifier,
    context,
    defaultResolve,
) {
    const extension =
        specifier.startsWith('.') &&
        !specifier.endsWith('.js') &&
        !specifier.endsWith('.mjs')
            ? '.js'
            : '';

    return defaultResolve(
        specifier + extension,
        context,
        defaultResolve,
    );
}
