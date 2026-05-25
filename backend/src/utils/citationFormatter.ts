interface ICitationParams {
  // Common Fields
  title?: string;
  creator?: string;      // Author, Interviewee, Photographer, or Painter
  date?: string;         // Publication date, interview date, or creation date
  url?: string;
  
  // Specific Context Fields
  publicationName?: string; // Newspaper title, Magazine title, or Archive collection
  pubPlace?: string;        // City of publication or Repository location
  publisher?: string;       // Publisher name or Museum/Archive name
  pageNumbers?: string;     // Specific pages or item tracking numbers
  interviewer?: string;     // For oral history tracking
  formatType?: string;      // e.g., "Oil on canvas", "Digital image", "Audio recording"
}

export class ChicagoFormatter {
  /**
   * Universal router that accepts a source type and outputs a perfect Chicago Manual of Style Footnote
   */
  static format(type: 'Book' | 'Newspaper' | 'Magazine' | 'Census' | 'OralHistory' | 'Portrait' | 'Custom', params: ICitationParams): string {
    const { title, creator, date, url, publicationName, pubPlace, publisher, pageNumbers, interviewer, formatType } = params;
    
    switch (type) {
      case 'Book': {
        const authorPart = creator ? `${creator}, ` : '';
        const pubPart = (pubPlace || publisher || date) 
          ? ` (${pubPlace ? pubPlace + ': ' : ''}${publisher ? publisher + ', ' : ''}${date || ''})` 
          : '';
        const pagePart = pageNumbers ? `, ${pageNumbers}` : '';
        return `${authorPart}_${title}_${pubPart}${pagePart}.`;
      }

      case 'Newspaper': {
        // Format: Author, "Article Title," *Newspaper Name* (City, State), Month Day, Year, Page. URL.
        const authorPart = creator ? `${creator}, ` : '';
        const titlePart = title ? `"${title}," ` : '';
        const locationPart = pubPlace ? ` (${pubPlace})` : '';
        const datePart = date ? `, ${date}` : '';
        const pagePart = pageNumbers ? `, ${pageNumbers}` : '';
        const urlPart = url ? `; digital image, (${url})` : '';
        return `${authorPart}${titlePart}_${publicationName}_${locationPart}${datePart}${pagePart}${urlPart}.`;
      }

      case 'Magazine': {
        // Format: Author, "Article Title," *Magazine Name* Volume, no. Issue (Date): Page. URL.
        const authorPart = creator ? `${creator}, ` : '';
        const titlePart = title ? `"${title}," ` : '';
        const datePart = date ? ` (${date})` : '';
        const pagePart = pageNumbers ? `: ${pageNumbers}` : '';
        const urlPart = url ? `, ${url}` : '';
        return `${authorPart}${titlePart}_${publicationName}_${datePart}${pagePart}${urlPart}.`;
      }

      case 'Census': {
        const loc = pubPlace ? `, ${pubPlace}` : ''; // e.g. "Cook County, Illinois"
        const pagePart = pageNumbers ? `, p. ${pageNumbers}` : '';
        const urlPart = url ? `; digital image, _Ancestry.com_ (${url})` : '';
        return `${date} U.S. census, population schedule${loc}${pagePart}${urlPart}.`;
      }

      case 'OralHistory': {
        // Format: Interviewee, interview by Interviewer, Date, location/transcript info.
        const speaker = creator || 'Unidentified Interviewee';
        const team = interviewer ? `interview by ${interviewer}` : 'oral interview';
        const datePart = date ? `, ${date}` : '';
        const notes = publicationName ? `, ${publicationName}` : ''; // Collection or location details
        return `${speaker}, ${team}${datePart}${notes}.`;
      }

      case 'Portrait': {
        // Format: Creator, *Title*, Date, Medium, Repository/Owner (Location).
        const artist = creator ? `${creator}, ` : 'Unknown Artist, ';
        const medium = formatType ? `, ${formatType}` : '';
        const repo = publisher ? `, ${publisher}` : '';
        const loc = pubPlace ? ` (${pubPlace})` : '';
        return `${artist}_${title}_${medium}${repo}${loc}, dated ${date || 'unknown'}.`;
      }

      default:
        // Fallback custom free-text citation if the user wants to paste an Evidence Explained string directly
        return title || 'Unspecified genealogical source record.';
    }
  }
}