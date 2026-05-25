interface IChicagoBookParams {
  author?: string;
  title: string;
  publisher?: string;
  pubPlace?: string;
  pubYear?: string;
  pageNumbers?: string;
}

interface IChicagoCensusParams {
  year: string;
  state: string;
  county: string;
  locality?: string;
  roll?: string;
  page?: string;
  url?: string;
}

export class ChicagoFormatter {
  /**
   * Generates a standard Chicago Style (17th Edition) Footnote for a Book / Published Record set
   * Format: Author, *Title* (Place of Publication: Publisher, Year), Page numbers.
   */
  static formatBook(params: IChicagoBookParams): string {
    const { author, title, publisher, pubPlace, pubYear, pageNumbers } = params;
    
    let authorPart = author ? `${author}, ` : '';
    let pubPart = '';
    
    if (pubPlace || publisher || pubYear) {
      pubPart = ` (${pubPlace ? pubPlace + ': ' : ''}${publisher ? publisher + ', ' : ''}${pubYear || ''})`;
    }
    
    let pagePart = pageNumbers ? `, ${pageNumbers}` : '';
    
    return `${authorPart}_${title}_${pubPart}${pagePart}.`;
  }

  /**
   * Generates a dynamic layered Chicago Style Footnote for US Federal Census Records
   * Format: Year U.S. census, County, State, population schedule, locality, page, National Archives microfilm, URL.
   */
  static formatCensus(params: IChicagoCensusParams): string {
    const { year, state, county, locality, roll, page, url } = params;
    
    let base = `${year} U.S. census, ${county} County, ${state}, population schedule`;
    if (locality) base += `, ${locality}`;
    if (page) base += `, p. ${page}`;
    if (roll) base += `, National Archives microfilm publication ${roll}`;
    if (url) base += `; digital image, _Ancestry.com_ (${url})`;
    
    return `${base}.`;
  }
}