# taffa
With this package you can easily request the menu for Teknologföreningen's restaurant Dagsen, or as it's more commonly know as, Täffä.

## Usage
```ts
menu(date?: Date | number, language?: "sv" | "fi" | "en"): Promise<ITaffaMenu>

week(language?: "sv" | "fi" | "en"): Promise<ITaffaMenu[]>
```
