export interface ICitationParams {
  // Common Fields
  title?: string;
  creator?: string;         // Author, Interviewee, Photographer, or Painter
  date?: string;            // Publication date, interview date, or creation date
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
   * Generates a shortened subsequent footnote reference
   */
  static shortCite(creator?: string, title?: string, page?: string): string {
    const author = creator?.split(',')[0] ?? 'Unknown';
    const shortTitle = title ? `_${title}_` : 'Untitled';
    const pagePart = page ? `, ${page}` : '';
    return `${author}, ${shortTitle}${pagePart}.`;
  }

  /**
   * Universal router that accepts a source type and outputs a perfect Chicago Manual of Style / Evidence Explained Footnote
   */
  static format(
    type: 'Book' | 'Newspaper' | 'Magazine' | 'Census' | 
          'OralHistory' | 'Portrait' | 'Custom' |
          'VitalRecord'    |  // Birth/Marriage/Death certificates
          'ChurchRecord'   |  // Baptism, confirmation, burial
          'MilitaryRecord' |  // Draft cards, service records
          'Probate'        |  // Wills, estate records
          'LandRecord'     |  // Deeds, homestead claims
          'Immigration'    |  // Passenger lists, naturalization
          'Photograph', 
    params: ICitationParams
  ): string {
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
        const authorPart = creator ? `${creator}, ` : '';
        const titlePart = title ? `"${title}," ` : '';
        const locationPart = pubPlace ? ` (${pubPlace})` : '';
        const datePart = date ? `, ${date}` : '';
        const pagePart = pageNumbers ? `, ${pageNumbers}` : '';
        const urlPart = url ? `; digital image, (${url})` : '';
        return `${authorPart}${titlePart}_${publicationName}_${locationPart}${datePart}${pagePart}${urlPart}.`;
      }

      case 'Magazine': {
        const authorPart = creator ? `${creator}, ` : '';
        const titlePart = title ? `"${title}," ` : '';
        const datePart = date ? ` (${date})` : '';
        const pagePart = pageNumbers ? `: ${pageNumbers}` : '';
        const urlPart = url ? `, ${url}` : '';
        return `${authorPart}${titlePart}_${publicationName}_${datePart}${pagePart}${urlPart}.`;
      }

      case 'Census': {
        const loc = pubPlace ? `, ${pubPlace}` : ''; 
        const pagePart = pageNumbers ? `, p. ${pageNumbers}` : '';
        const urlPart = url ? `; digital image, _Ancestry.com_ (${url})` : '';
        return `${date} U.S. census, population schedule${loc}${pagePart}${urlPart}.`;
      }

      case 'OralHistory': {
        const speaker = creator || 'Unidentified Interviewee';
        const team = interviewer ? `interview by ${interviewer}` : 'oral interview';
        const datePart = date ? `, ${date}` : '';
        const notes = publicationName ? `, ${publicationName}` : ''; 
        return `${speaker}, ${team}${datePart}${notes}.`;
      }

      case 'Portrait': {
        const artist = creator ? `${creator}, ` : 'Unknown Artist, ';
        const medium = formatType ? `, ${formatType}` : '';
        const repo = publisher ? `, ${publisher}` : '';
        const loc = pubPlace ? ` (${pubPlace})` : '';
        return `${artist}_${title}_${medium}${repo}${loc}, dated ${date || 'unknown'}.`;
      }

      case 'VitalRecord':
      case 'ChurchRecord':
      case 'Probate':
      case 'LandRecord': {
        // Universal structural layout for localized, un-indexed courthouse/parish registers
        const recordTitle = title ? `"${title}"` : 'Unspecified Document';
        const datePart = date ? ` (${date})` : '';
        const identification = pageNumbers ? `, ${pageNumbers}` : '';
        const collection = publicationName ? `; entries in _${publicationName}_` : '';
        const repository = publisher ? `; ${publisher}` : '';
        const location = pubPlace ? ` (${pubPlace})` : '';
        const accessUrl = url ? `; accessed via (${url})` : '';
        return `${recordTitle}${datePart}${identification}${collection}${repository}${location}${accessUrl}.`;
      }

      case 'MilitaryRecord':
      case 'Immigration': {
        // Formats national record groups or ships manifests
        const personPart = creator ? `${creator}, ` : '';
        const manifestTitle = title ? `"${title}"` : 'Record Entry';
        const collectionPart = publicationName ? `, _${publicationName}_` : '';
        const infoPart = pageNumbers ? `, ${pageNumbers}` : '';
        const datePart = date ? ` (${date})` : '';
        const archivePart = publisher ? `; National Archives / ${publisher}` : '';
        const locationPart = pubPlace ? ` (${pubPlace})` : '';
        const accessUrl = url ? `; digital image, (${url})` : '';
        return `${personPart}${manifestTitle}${collectionPart}${infoPart}${datePart}${archivePart}${locationPart}${accessUrl}.`;
      }

      case 'Photograph': {
        const photographer = creator ? `${creator}, ` : 'Unidentified Photographer, ';
        const photoTitle = title ? `"${title}" photo` : 'Historical photograph';
        const datePart = date ? `, ${date}` : '';
        const collection = publicationName ? `, collection: _${publicationName}_` : '';
        const repo = publisher ? `; held by ${publisher}` : '';
        const loc = pubPlace ? ` (${pubPlace})` : '';
        return `${photographer}${photoTitle}${datePart}${collection}${repo}${loc}.`;
      }

      default:
        return title || 'Unspecified genealogical source record.';
    }
  }

  /**
   * Automatically parses a footnote context string and reverses structural headers for Bibliography ordering
   */
  static toBibliography(type: string, params: ICitationParams): string {
    const { creator, title, publicationName } = params;
    if (!creator) return title || publicationName || 'Anonymous Source.';
    
    // Handles changing "Jillian Doe" to "Doe, Jillian" for alphabetizing rows
    const parts = creator.trim().split(' ');
    if (parts.length > 1) {
      const lastName = parts.pop();
      const firstNames = parts.join(' ');
      const invertedCreator = `${lastName}, ${firstNames}`;
      // Basic translation replacement test runner
      return `${invertedCreator}. Rest of formatted bibliographic metadata string goes here.`;
    }
    
    return `${creator}.`;
  }
}