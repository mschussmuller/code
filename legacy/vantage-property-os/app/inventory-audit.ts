import type { Project, Unit } from "./data";

export type InventoryAudit = {
 reviewedAt: string; status: "Cotejado" | "Parcial" | "Sin cotejo";
 checkedUnits: number; areaCorrections: number; addedUnits: number;
 sourceModifiedAt?: string;
 sources: { label: string; url: string }[]; notes: string[]; pending: string[];
};

export const inventoryAudit: Record<string, InventoryAudit> = {
  "solana-2": {
    "reviewedAt": "2026-08-27",
    "status": "Parcial",
    "checkedUnits": 34,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Torre Solana2-Lista de precios.pdf",
        "url": "https://drive.google.com/file/d/173unhmAsCPzkQdc3WRpvTbNjgYg2c1rT/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "34 filas libres con identificador coinciden en precio y m² propios. Hay 2 filas libres 1D C sin código legible (pisos 1 y 4, 43,11 m²; USD 100.263 y 100.573); no se inventaron unidades."
    ],
    "pending": [
      "Solicitar códigos de las dos filas 1D C libres. Confirmar vigencia de la lista sin fecha explícita."
    ],
    "sourceModifiedAt": "2026-08-21T03:12:34.000Z"
  },
  "narciso": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 86,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Narciso LC - Lista Precios - 18.08.26.pdf",
        "url": "https://drive.google.com/file/d/1kvXJ7m0RIUQFAP3H0rXYGStzkziBKnSN/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-21T03:12:59.000Z"
  },
  "casas-bosque": {
    "reviewedAt": "2026-08-27",
    "status": "Parcial",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista Casas del Bosque. 2_2_2026.pdf",
        "url": "https://drive.google.com/file/d/1xIRDW0-euZ0Epf_USzQ8jBXA0UHoLdKC/view"
      }
    ],
    "notes": [
      "Lista del 02/02/2026 con precios pozo y lista de 12 casas, sin estado comercial. Las 2 referencias históricas existentes permanecen sin habilitación para cotizar."
    ],
    "pending": [
      "Confirmar disponibilidad y precio vigente de cada casa; no confundir precio pozo histórico con precio de lista."
    ],
    "sourceModifiedAt": "2026-08-21T03:13:20.000Z"
  },
  "blu": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Disponibilidad Blu (1).pdf",
        "url": "https://drive.google.com/file/d/1AhCDH3l2nQ8Ou4MN5ZSX-mFdy_dFazMf/view"
      }
    ],
    "notes": [],
    "pending": [
      "PDF sin texto recuperable. Solicitar lista legible o capturas completas; no se cargaron unidades sin evidencia."
    ],
    "sourceModifiedAt": "2026-08-19T14:57:18.000Z"
  },
  "mood-office": {
    "reviewedAt": "2026-08-27",
    "status": "Parcial",
    "checkedUnits": 60,
    "areaCorrections": 60,
    "addedUnits": 0,
    "sources": [
      {
        "label": "MOOD LP Julio 2026.pdf",
        "url": "https://drive.google.com/file/d/1yvsF5oAM8oSfTJjg1ugWiapZdNr_aI5i/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Lista de julio de 2026: 60 oficinas. Oficina con balcón: 68,5 o 116 m²; cochera: 12,5 o 25 m² por separado. Se conserva el precio del conjunto."
    ],
    "pending": [
      "Solicitar lista vigente: el documento disponible es de julio de 2026."
    ],
    "sourceModifiedAt": "2026-08-21T03:29:05.000Z"
  },
  "ventura": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 27,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "CREO - VENTURA YKUA SATI TORRE II - PRECIOS Y DISPONIBILIDAD - 2026-08-19.pdf",
        "url": "https://drive.google.com/file/d/1RL7rSI4CCdfXq_69H_4IemGeY6niVGXL/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "La lista sólo identifica superficie total. No se presenta como interior ni se inventa su desglose."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-24T22:44:15.289Z"
  },
  "venire": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 56,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "CREO - VENIRE 568 - PRECIOS Y DISPONIBILIDAD - 2026-08-20.pdf",
        "url": "https://drive.google.com/file/d/1t-ceYOuEKAG2UTdyBappm4oqBzZqlEfH/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Superficie total del departamento = cubierta + balcón, según encabezados de la lista. No incluye una cochera añadida."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-24T22:44:02.086Z"
  },
  "venire-villa-morra": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 28,
    "areaCorrections": 28,
    "addedUnits": 0,
    "sources": [
      {
        "label": "CREO - VENIRE VILLA MORRA - PRECIOS Y DISPONIBILIDAD - 2026-08-10.pdf",
        "url": "https://drive.google.com/file/d/1s0BxJ5xURsVldcAPgS4Vlp9UxLFNGVOS/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros de departamento separados de cochera y baulera. Se excluye la reventa 605 sin precio. Las filas sin m² de baulera no se completan por inferencia."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-24T22:43:52.613Z"
  },
  "ventura-torre-1": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 7,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "CREO - VENTURA YKUA SATI TORRE I - PRECIOS Y DISPONIBILIDAD - 2026-08-20.pdf",
        "url": "https://drive.google.com/file/d/1hkJpMGkI3y8-1dfp7QLdr_zpmkVo6GTW/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "La lista sólo identifica superficie total. No se presenta como interior ni se inventa su desglose."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-24T22:44:10.956Z"
  },
  "ventura-hassler": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 2,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "CREO - VENTURA HASSLER - PRECIOS Y DISPONIBILIDAD - 2026-08-14.pdf",
        "url": "https://drive.google.com/file/d/1BhnVPJ8ukgypH0KziSAYKhlV-bGUPo1r/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "La lista sólo identifica superficie total. No se presenta como interior ni se inventa su desglose."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-24T22:44:24.578Z"
  },
  "insignia-07": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 35,
    "areaCorrections": 1,
    "addedUnits": 34,
    "sources": [
      {
        "label": "Lista de precio Insignia 7. Torre A y B.pdf",
        "url": "https://drive.google.com/file/d/1Fe5Dn2K869fMS7VxVYQFK-oxyEi6Zglb/view"
      },
      {
        "label": "Lista de precio Insignia 7. Torre C y D.pdf",
        "url": "https://drive.google.com/file/d/1xK4kMc8zajYyw9TBVf_tLrvLoTkr2i6K/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Precio pozo y cocheras según cada fila. La lista no indica una fecha de vigencia.",
      "35 unidades con precio: 1 en A/B y 34 en C/D. Se incorporaron las 34 de C/D; las vendidas quedan excluidas."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-21T03:21:38.000Z"
  },
  "insignia-08": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 27,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista de precio Insignia 8. Torre C y D.pdf",
        "url": "https://drive.google.com/file/d/1TwQVvBDamQPmyVF8FYD8MBdHfHyfVFcF/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Precio pozo y cocheras según cada fila. La lista no indica una fecha de vigencia."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-17T14:30:33.000Z"
  },
  "insignia-09": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 46,
    "areaCorrections": 46,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista de precio IG9.pdf",
        "url": "https://drive.google.com/file/d/1JTgBAcBdG42LPwJEgSueha81jWQZ2LZF/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Precio pozo y cocheras según cada fila. La lista no indica una fecha de vigencia."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-17T14:30:44.000Z"
  },
  "insignia-10": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 18,
    "areaCorrections": 18,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista de precio Insignia 10. Torre A y B 19.52.58.pdf",
        "url": "https://drive.google.com/file/d/17XHk_FwiMWydjB-ZBIefcyECefubc8Zt/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Precio pozo y cocheras según cada fila. La lista no indica una fecha de vigencia."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-17T14:31:00.000Z"
  },
  "insignia-11": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 32,
    "areaCorrections": 32,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista de precio Insignia 11.pdf",
        "url": "https://drive.google.com/file/d/1bkXGQUZb9ym1hCFJx8DezByY-uO2fjO6/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Precio pozo y cocheras según cada fila. La lista no indica una fecha de vigencia."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-17T14:31:07.000Z"
  },
  "city-02": {
    "reviewedAt": "2026-08-31",
    "status": "Cotejado",
    "checkedUnits": 21,
    "areaCorrections": 21,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista de precio City 2..pdf",
        "url": "https://drive.google.com/file/d/1mjLMcivPB0XmHdcSp6CkzwN4FG28Qbbi/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Última lista aportada: 28/08/2026; C53, C54 y C33 figuran vendidas."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-31T13:34:58.296Z"
  },
  "terra-02": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 25,
    "areaCorrections": 25,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Lista de Precio Insignia Terra 2.pdf",
        "url": "https://drive.google.com/file/d/1GstA5MpIyjscv9ux4eiUYnuRnurT-DkF/view"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "Metros del departamento separados de comunes, patio y cochera. Precio pozo y cocheras según cada fila. La lista no indica una fecha de vigencia."
    ],
    "pending": [
      "Confirmar vigencia de lista y disponibilidad antes de cotizar."
    ],
    "sourceModifiedAt": "2026-08-17T14:31:19.000Z"
  },
  "bi-dhome-campos": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQCO28BCyeQFQoBfNgpQOwPlAYvlYETR6ZUmbML9lpqKeNc?e=efmF0U"
      }
    ],
    "notes": [],
    "pending": [
      "Planilla SharePoint no accesible para cotejo en esta revisión. Solicitar Excel o capturas completas. Se conserva la carga anterior sin marcarla como reconfirmada."
    ]
  },
  "bi-velvet-mariscal": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQD_pVJUkmJST7J4aAdO0ASNAQxffJpr8sx2jk_0BJNIPEo?e=cjqLSK"
      }
    ],
    "notes": [],
    "pending": [
      "Planilla SharePoint no accesible para cotejo en esta revisión. Solicitar Excel o capturas completas. Se conserva la carga anterior sin marcarla como reconfirmada."
    ]
  },
  "bi-filum-herrera": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBU6huuSqjyRYlA3DOQoSzxAfcrXB2nzOVGyYSo2BLiH3A?e=A73M82"
      }
    ],
    "notes": [],
    "pending": [
      "Planilla SharePoint no accesible para cotejo en esta revisión. Solicitar Excel o capturas completas. Se conserva la carga anterior sin marcarla como reconfirmada."
    ]
  },
  "bi-filum-recoleta": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQDj8HXIy9xCT7YiNUT9T7LrAYXjyFHPFyW0rSXx6Jo6ZTk?e=CWdgRG"
      }
    ],
    "notes": [],
    "pending": [
      "Planilla SharePoint no accesible para cotejo en esta revisión. Solicitar Excel o capturas completas. Se conserva la carga anterior sin marcarla como reconfirmada."
    ]
  },
  "bi-dhome-cdd": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQB3jPdB0lwiRaphY4PnZoEjAaL0GgeCP6eDsDeZdyPVbUw?e=f1TmUM"
      }
    ],
    "notes": [],
    "pending": [
      "Planilla SharePoint no accesible para cotejo en esta revisión. Solicitar Excel o capturas completas. Se conserva la carga anterior sin marcarla como reconfirmada."
    ]
  },
  "bi-san-clemente-norte": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQB_ruDRfiG6SqAPZdMOLkaNAT8A5aezWHh0oHGoPpjwI-Q?e=cquLpT"
      }
    ],
    "notes": [],
    "pending": [
      "Planilla SharePoint no accesible para cotejo en esta revisión. Solicitar Excel o capturas completas. Se conserva la carga anterior sin marcarla como reconfirmada."
    ]
  },
  "bi-san-clemente-santa-teresa": {
    "reviewedAt": "2026-08-27",
    "status": "Parcial",
    "checkedUnits": 4,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBCXoo6q-r3Q5O7wudUxG0wAQU28YjrIvyCRGKQCJVclmg?e=vLePU0"
      }
    ],
    "notes": [
      "Cotejado con la captura aportada del 27/08/2026, no con el Excel completo. Precios, m² y cocheras coinciden. Unidades con renta activa; visitas coordinadas. Reservadas y cocheras sueltas excluidas."
    ],
    "pending": [
      "Solicitar Excel completo: la captura tiene filas ocultas/filtradas. No confirma inventario fuera de lo visible."
    ]
  },
  "bi-santa-marina-norte": {
    "reviewedAt": "2026-08-27",
    "status": "Parcial",
    "checkedUnits": 2,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBCXoo6q-r3Q5O7wudUxG0wAQU28YjrIvyCRGKQCJVclmg?e=vLePU0"
      }
    ],
    "notes": [
      "Cotejado con la captura aportada del 27/08/2026, no con el Excel completo. Precios, m² y cocheras coinciden. Unidades con renta activa; visitas coordinadas. Reservadas y cocheras sueltas excluidas."
    ],
    "pending": [
      "Solicitar Excel completo: la captura tiene filas ocultas/filtradas. No confirma inventario fuera de lo visible."
    ]
  },
  "bi-san-clemente-fernando": {
    "reviewedAt": "2026-08-27",
    "status": "Parcial",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBCXoo6q-r3Q5O7wudUxG0wAQU28YjrIvyCRGKQCJVclmg?e=vLePU0"
      }
    ],
    "notes": [
      "Cotejado con la captura aportada del 27/08/2026, no con el Excel completo. Precios, m² y cocheras coinciden. Unidades con renta activa; visitas coordinadas. Reservadas y cocheras sueltas excluidas."
    ],
    "pending": [
      "Solicitar Excel completo: la captura tiene filas ocultas/filtradas. No confirma inventario fuera de lo visible."
    ]
  },
  "avanza-unico": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://drive.google.com/drive/folders/10kCQDtpTYVrdXTTaJv8F5qzpt9MTjKnh"
      }
    ],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista vigente y m² de las unidades de The Collection, más brochure individual. Se conservan las referencias de abril fuera de cotización."
    ]
  },
  "avanza-in-1362": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://drive.google.com/drive/folders/1JzKwP6b59iT0HD_ugCrMjobv51uK6__e"
      }
    ],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista vigente y m² de las unidades de The Collection, más brochure individual. Se conservan las referencias de abril fuera de cotización."
    ]
  },
  "avanza-houze": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "Fuente comercial",
        "url": "https://drive.google.com/drive/folders/12UJ9BV372o47VjvvXWKNDNFcDc1zfAvT"
      }
    ],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista vigente y m² de las unidades de The Collection, más brochure individual. Se conservan las referencias de abril fuera de cotización."
    ]
  },
  "avanza-well": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista oficial de disponibilidad, precios y m² por unidad. Se mantiene como catálogo sin unidades cotizables."
    ]
  },
  "avanza-viwwo": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista oficial de disponibilidad, precios y m² por unidad. Se mantiene como catálogo sin unidades cotizables."
    ]
  },
  "avanza-nest": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista oficial de disponibilidad, precios y m² por unidad. Se mantiene como catálogo sin unidades cotizables."
    ]
  },
  "avanza-aura": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista oficial de disponibilidad, precios y m² por unidad. Se mantiene como catálogo sin unidades cotizables."
    ]
  },
  "avanza-harbor": {
    "reviewedAt": "2026-08-27",
    "status": "Sin cotejo",
    "checkedUnits": 0,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [],
    "notes": [
      "Carpetas comerciales revisadas: material visual/documental, sin lista vigente de unidades, precios y superficies."
    ],
    "pending": [
      "Solicitar lista oficial de disponibilidad, precios y m² por unidad. Se mantiene como catálogo sin unidades cotizables."
    ]
  },
  "r5-las-lomas": {
    "reviewedAt": "2026-08-27",
    "status": "Cotejado",
    "checkedUnits": 8,
    "areaCorrections": 0,
    "addedUnits": 0,
    "sources": [
      {
        "label": "INTERNO - R5 Las Lomas - Lista de precios Agosto 2026.pdf",
        "url": "https://drive.google.com/file/d/16NTblM2sLm_HpMV5zJjUXiW5BYXXcAPo/view?usp=drivesdk"
      }
    ],
    "notes": [
      "Precios y unidades cotejados contra el documento indicado. No equivale a confirmación comercial de disponibilidad hoy.",
      "8 departamentos disponibles; 5 cocheras con baulera a USD 23.000, separadas del inventario habitacional. Fuente: agosto de 2026, sin día indicado."
    ],
    "pending": [],
    "sourceModifiedAt": "2026-08-27T13:24:10.940Z"
  }
};

// Source-specific column mappings, reproduced by tests/parse-audit-sources.mjs.
const areaGroups: { projectId: string; codes: string[]; fields: Partial<Unit> }[] = [
  {
    "projectId": "city-02",
    "codes": [
      "A53",
      "A54",
      "A43",
      "A44",
      "C42",
      "A33",
      "C32",
      "A23",
      "C22",
      "C23",
      "C24",
      "A13",
      "A14",
      "C12",
      "C13",
      "C14"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 15.9,
      "ownM2": 61.5,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 61.5,
      "balconyM2": -1
    }
  },
  {
    "projectId": "city-02",
    "codes": [
      "C51",
      "A31",
      "A21",
      "A11",
      "C11"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 18.5,
      "ownM2": 71.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 71.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-07",
    "codes": [
      "B43"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10.9,
      "ownM2": 51.1,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 51.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-08",
    "codes": [
      "C48",
      "C46",
      "C44",
      "C42",
      "D48",
      "D46",
      "D44",
      "D42",
      "C38",
      "C32",
      "D38",
      "D36",
      "D34",
      "C28",
      "D28",
      "D22",
      "C18"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10,
      "ownM2": 44.1,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 44.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-08",
    "codes": [
      "C41",
      "D41",
      "C21",
      "D29",
      "D21",
      "C11",
      "D19",
      "D11"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.4,
      "ownM2": 50.1,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 50.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-08",
    "codes": [
      "D04"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10,
      "ownM2": 44.1,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 28,
      "totalM2": 44.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-08",
    "codes": [
      "D02"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10,
      "ownM2": 44.1,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 63,
      "totalM2": 44.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A72",
      "A74",
      "A76",
      "A78",
      "A62",
      "A64",
      "A66",
      "A68",
      "A52",
      "A54",
      "A58",
      "A42",
      "A44",
      "A46",
      "A48",
      "A32",
      "A34",
      "A36",
      "A38",
      "A22",
      "A24",
      "A28",
      "A14",
      "A16",
      "A18"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.5,
      "ownM2": 43.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 43.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A75"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 17.8,
      "ownM2": 67.1,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 67.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A67",
      "A51",
      "A59",
      "A41",
      "A49",
      "A31",
      "A39",
      "A21",
      "A29",
      "A11"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 13.2,
      "ownM2": 49.7,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 49.7,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A53",
      "A43",
      "A33",
      "A23",
      "A13"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10.4,
      "ownM2": 39.2,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 39.2,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A57",
      "A27",
      "A17"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 9.8,
      "ownM2": 36.8,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 36.8,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A04"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.5,
      "ownM2": 43.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 23.2,
      "totalM2": 43.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-09",
    "codes": [
      "A06"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.5,
      "ownM2": 43.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 24.6,
      "totalM2": 43.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-10",
    "codes": [
      "B72"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 41.1,
      "ownM2": 118.9,
      "parking": 2,
      "parkingM2": 25,
      "totalM2": 118.9,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-10",
    "codes": [
      "B62",
      "B68",
      "B52"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 15.1,
      "ownM2": 43.7,
      "parking": 1,
      "parkingM2": 12.5,
      "totalM2": 43.7,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-10",
    "codes": [
      "B64",
      "B54",
      "B56",
      "A44",
      "A46",
      "B46",
      "A36",
      "B36",
      "A26",
      "B26",
      "B14",
      "B16"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 15.6,
      "ownM2": 45.1,
      "parking": 1,
      "parkingM2": 12.5,
      "totalM2": 45.1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-10",
    "codes": [
      "B11",
      "B19"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 17.2,
      "ownM2": 49.9,
      "parking": 1,
      "parkingM2": 12.5,
      "totalM2": 49.9,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-11",
    "codes": [
      "A82",
      "A84",
      "A86",
      "A88",
      "A76",
      "A78",
      "A64",
      "A54",
      "A56",
      "A42",
      "A44",
      "A46",
      "A48",
      "A32",
      "A34",
      "A38",
      "A22",
      "A24",
      "A26",
      "A14",
      "A16",
      "A18"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.1,
      "ownM2": 44.6,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 44.6,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-11",
    "codes": [
      "A75"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 17.1,
      "ownM2": 68.8,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 68.8,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-11",
    "codes": [
      "A51",
      "A41",
      "A21",
      "A29",
      "A11",
      "A19"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 12.5,
      "ownM2": 50.5,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 50.5,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-11",
    "codes": [
      "A01"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 12.5,
      "ownM2": 50.5,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 21.7,
      "totalM2": 50.5,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-11",
    "codes": [
      "A03"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 12.9,
      "ownM2": 52.2,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 25.6,
      "totalM2": 52.2,
      "balconyM2": -1
    }
  },
  {
    "projectId": "insignia-11",
    "codes": [
      "A04"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.1,
      "ownM2": 44.6,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 21.7,
      "totalM2": 44.6,
      "balconyM2": -1
    }
  },
  {
    "projectId": "mood-office",
    "codes": [
      "9B",
      "9E",
      "9F",
      "11A",
      "11B",
      "11E",
      "11F",
      "12A",
      "12B",
      "12E",
      "12F",
      "14A",
      "14B",
      "14E",
      "14F",
      "16A",
      "16B",
      "16E",
      "16F",
      "17B",
      "17E",
      "17F",
      "18A",
      "18B",
      "18E",
      "18F",
      "19B",
      "19F",
      "20A",
      "20B",
      "20E",
      "20F",
      "22A",
      "22B",
      "22F",
      "24B",
      "24E",
      "24F"
    ],
    "fields": {
      "areaLabel": "de oficina con balcón",
      "balconyM2": 29.8,
      "internalM2": 86.2,
      "ownM2": 116,
      "parking": 2,
      "parkingM2": 25,
      "totalM2": 116
    }
  },
  {
    "projectId": "mood-office",
    "codes": [
      "9G",
      "11G",
      "12C",
      "12D",
      "14C",
      "14D",
      "16G",
      "16H",
      "17C",
      "17D",
      "18G",
      "18H",
      "19C",
      "19G",
      "20C",
      "20D",
      "20G",
      "20H",
      "22G",
      "22H",
      "24C",
      "24D"
    ],
    "fields": {
      "areaLabel": "de oficina con balcón",
      "balconyM2": 15.2,
      "internalM2": 53.3,
      "ownM2": 68.5,
      "parking": 1,
      "parkingM2": 12.5,
      "totalM2": 68.5
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "108",
      "308",
      "410",
      "1012",
      "1110",
      "1212",
      "1308",
      "1309",
      "1310",
      "1311",
      "1312",
      "1408",
      "1409",
      "1410",
      "1411",
      "1412"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 46.4,
      "totalM2": 46.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "113",
      "213",
      "313",
      "913",
      "1113",
      "1213"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 47.2,
      "totalM2": 47.2,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "114",
      "214",
      "814",
      "1114"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 66.4,
      "totalM2": 66.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "115",
      "116",
      "215",
      "216",
      "315",
      "316",
      "414",
      "415",
      "515",
      "516",
      "614",
      "615",
      "715",
      "716",
      "815",
      "816",
      "915",
      "1015",
      "1115",
      "1116",
      "1215",
      "1216"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 73.5,
      "totalM2": 73.5,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "117",
      "118",
      "217",
      "218",
      "317",
      "416",
      "417",
      "518",
      "616",
      "617",
      "717",
      "718",
      "817",
      "818",
      "917",
      "918",
      "1117",
      "1118",
      "1218",
      "1316",
      "1317",
      "1416",
      "1417"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 49.75,
      "totalM2": 49.75,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "201",
      "402",
      "403",
      "501",
      "703",
      "704",
      "803",
      "1102",
      "1407"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 27.75,
      "totalM2": 27.75,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "314",
      "514"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 128.8,
      "totalM2": 128.8,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "1314",
      "1414"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 109.7,
      "totalM2": 109.7,
      "balconyM2": -1
    }
  },
  {
    "projectId": "narciso",
    "codes": [
      "1315",
      "1415"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 101.3,
      "totalM2": 101.3,
      "balconyM2": -1
    }
  },
  {
    "projectId": "r5-las-lomas",
    "codes": [
      "101",
      "401",
      "501"
    ],
    "fields": {
      "areaLabel": "según lista",
      "totalM2": 52.75
    }
  },
  {
    "projectId": "r5-las-lomas",
    "codes": [
      "106",
      "206"
    ],
    "fields": {
      "areaLabel": "según lista",
      "totalM2": 37.16
    }
  },
  {
    "projectId": "r5-las-lomas",
    "codes": [
      "406"
    ],
    "fields": {
      "areaLabel": "según lista",
      "totalM2": 33.7
    }
  },
  {
    "projectId": "r5-las-lomas",
    "codes": [
      "502"
    ],
    "fields": {
      "areaLabel": "según lista",
      "totalM2": 31.15
    }
  },
  {
    "projectId": "r5-las-lomas",
    "codes": [
      "505"
    ],
    "fields": {
      "areaLabel": "según lista",
      "totalM2": 62.5
    }
  },
  {
    "projectId": "solana-2",
    "codes": [
      "102",
      "103",
      "201",
      "202",
      "402",
      "701",
      "703",
      "704"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 45.32,
      "totalM2": 45.32,
      "balconyM2": -1
    }
  },
  {
    "projectId": "solana-2",
    "codes": [
      "114",
      "214",
      "314"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 45.48,
      "totalM2": 45.48,
      "balconyM2": -1
    }
  },
  {
    "projectId": "solana-2",
    "codes": [
      "112",
      "212",
      "312",
      "412",
      "512",
      "712"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 80.36,
      "totalM2": 80.36,
      "balconyM2": -1
    }
  },
  {
    "projectId": "solana-2",
    "codes": [
      "115",
      "215",
      "315",
      "415",
      "515",
      "615",
      "715"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 80.7,
      "totalM2": 80.7,
      "balconyM2": -1
    }
  },
  {
    "projectId": "solana-2",
    "codes": [
      "109",
      "209",
      "609",
      "709"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 86.75,
      "totalM2": 86.75,
      "balconyM2": -1
    }
  },
  {
    "projectId": "solana-2",
    "codes": [
      "111",
      "211",
      "311",
      "411",
      "511",
      "611"
    ],
    "fields": {
      "areaLabel": "propios",
      "ownM2": 97.44,
      "totalM2": 97.44,
      "balconyM2": -1
    }
  },
  {
    "projectId": "terra-02",
    "codes": [
      "A201",
      "B201",
      "B213"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10.8,
      "ownM2": 44.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 44.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "terra-02",
    "codes": [
      "A203",
      "A206",
      "A207",
      "A209",
      "A211",
      "A212",
      "A213",
      "A214",
      "A215",
      "A216",
      "B203",
      "B205",
      "B206",
      "B209",
      "B212",
      "A108",
      "A114"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 10.8,
      "ownM2": 42.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 42.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "terra-02",
    "codes": [
      "A117",
      "A118",
      "B101",
      "B102",
      "B113"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "commonM2": 11.3,
      "ownM2": 44.4,
      "parking": 1,
      "parkingM2": 12.5,
      "patioM2": 0,
      "totalM2": 44.4,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire",
    "codes": [
      "101",
      "201",
      "301",
      "401",
      "601",
      "701"
    ],
    "fields": {
      "areaLabel": "con balcón",
      "balconyM2": 6.69,
      "ownM2": 77.8,
      "totalM2": 84.49,
      "internalM2": 77.8
    }
  },
  {
    "projectId": "venire",
    "codes": [
      "102",
      "103",
      "202",
      "203",
      "302",
      "402",
      "702"
    ],
    "fields": {
      "areaLabel": "con balcón",
      "balconyM2": 4.01,
      "ownM2": 42.35,
      "totalM2": 46.36,
      "internalM2": 42.35
    }
  },
  {
    "projectId": "venire",
    "codes": [
      "104",
      "105",
      "204",
      "205",
      "304",
      "305",
      "605",
      "704",
      "705",
      "805"
    ],
    "fields": {
      "areaLabel": "con balcón",
      "balconyM2": 0,
      "ownM2": 30.79,
      "totalM2": 30.79,
      "internalM2": 30.79
    }
  },
  {
    "projectId": "venire",
    "codes": [
      "106",
      "107",
      "108",
      "206",
      "207",
      "208",
      "306",
      "307",
      "606",
      "607",
      "706",
      "707",
      "708",
      "808"
    ],
    "fields": {
      "areaLabel": "con balcón",
      "balconyM2": 0,
      "ownM2": 30.2,
      "totalM2": 30.2,
      "internalM2": 30.2
    }
  },
  {
    "projectId": "venire",
    "codes": [
      "109",
      "209",
      "309",
      "409",
      "709",
      "809"
    ],
    "fields": {
      "areaLabel": "con balcón",
      "balconyM2": 4.4,
      "ownM2": 43.52,
      "totalM2": 47.92,
      "internalM2": 43.52
    }
  },
  {
    "projectId": "venire",
    "codes": [
      "110",
      "111",
      "210",
      "211",
      "310",
      "311",
      "411",
      "610",
      "611",
      "710",
      "711",
      "810",
      "811"
    ],
    "fields": {
      "areaLabel": "con balcón",
      "balconyM2": 4.01,
      "ownM2": 41.85,
      "totalM2": 45.86,
      "internalM2": 41.85
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "102",
      "109"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 113.23,
      "parking": 2,
      "parkingM2": 25,
      "storageM2": 2,
      "totalM2": 113.23,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "103"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 64.27,
      "parking": 1,
      "parkingM2": 12.5,
      "storageM2": 2,
      "totalM2": 64.27,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "104",
      "107"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 70.08,
      "parking": 1,
      "parkingM2": 12.5,
      "storageM2": 2,
      "totalM2": 70.08,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "202",
      "209",
      "309",
      "409",
      "502",
      "602",
      "609",
      "709",
      "802",
      "809"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 80,
      "parking": 2,
      "parkingM2": 25,
      "storageM2": 2,
      "totalM2": 80,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "204",
      "207",
      "304",
      "404",
      "607"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 45.72,
      "parking": 1,
      "parkingM2": 12.5,
      "storageM2": 2,
      "totalM2": 45.72,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "403",
      "508",
      "703"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 43.54,
      "parking": 1,
      "parkingM2": 12.5,
      "storageM2": 2,
      "totalM2": 43.54,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "603",
      "803"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 43.54,
      "parking": 1,
      "parkingM2": 12.5,
      "totalM2": 43.54,
      "balconyM2": -1
    }
  },
  {
    "projectId": "venire-villa-morra",
    "codes": [
      "707",
      "804",
      "807"
    ],
    "fields": {
      "areaLabel": "de departamento",
      "ownM2": 45.72,
      "parking": 1,
      "parkingM2": 12.5,
      "totalM2": 45.72,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "102",
      "202",
      "602"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 193.45,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "103",
      "203",
      "303",
      "403",
      "503",
      "603"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 131.91,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "104"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 98.59,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "105"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 158.75,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "106"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 149.95,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "107"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 137.75,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "201",
      "501"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 165.77,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "205",
      "305",
      "505",
      "605"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 82.76,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "206",
      "306",
      "406",
      "506",
      "606"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 95.14,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura",
    "codes": [
      "307",
      "407",
      "507"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 83.65,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-hassler",
    "codes": [
      "305"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 78,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-hassler",
    "codes": [
      "403"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 78.55,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-torre-1",
    "codes": [
      "101",
      "301"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 182.59,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-torre-1",
    "codes": [
      "103"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 49.94,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-torre-1",
    "codes": [
      "106",
      "206"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 113.32,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-torre-1",
    "codes": [
      "505"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 86.22,
      "ownM2": -1,
      "balconyM2": -1
    }
  },
  {
    "projectId": "ventura-torre-1",
    "codes": [
      "607"
    ],
    "fields": {
      "areaLabel": "totales según lista",
      "totalM2": 82.73,
      "ownM2": -1,
      "balconyM2": -1
    }
  }
];
const addedUnits: Unit[] = [
  {
    "id": "ig7-c71",
    "projectId": "insignia-07",
    "code": "C71",
    "floor": "7",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 78510,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c72",
    "projectId": "insignia-07",
    "code": "C72",
    "floor": "7",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 77581,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d71",
    "projectId": "insignia-07",
    "code": "D71",
    "floor": "7",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 2,
    "parkingM2": 25,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 93088,
    "status": "Disponible",
    "features": [
      "Torre D",
      "2 cocheras incluidas",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d72",
    "projectId": "insignia-07",
    "code": "D72",
    "floor": "7",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 2,
    "parkingM2": 25,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 91948,
    "status": "Disponible",
    "features": [
      "Torre D",
      "2 cocheras incluidas",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c61",
    "projectId": "insignia-07",
    "code": "C61",
    "floor": "6",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 78200,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c62",
    "projectId": "insignia-07",
    "code": "C62",
    "floor": "6",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 77271,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c63",
    "projectId": "insignia-07",
    "code": "C63",
    "floor": "6",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 77271,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c64",
    "projectId": "insignia-07",
    "code": "C64",
    "floor": "6",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 78200,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d61",
    "projectId": "insignia-07",
    "code": "D61",
    "floor": "6",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 2,
    "parkingM2": 25,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 91568,
    "status": "Disponible",
    "features": [
      "Torre D",
      "2 cocheras incluidas",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d62",
    "projectId": "insignia-07",
    "code": "D62",
    "floor": "6",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 2,
    "parkingM2": 25,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 92708,
    "status": "Disponible",
    "features": [
      "Torre D",
      "2 cocheras incluidas",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c51",
    "projectId": "insignia-07",
    "code": "C51",
    "floor": "5",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 77271,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c52",
    "projectId": "insignia-07",
    "code": "C52",
    "floor": "5",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 76342,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c53",
    "projectId": "insignia-07",
    "code": "C53",
    "floor": "5",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 76342,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c54",
    "projectId": "insignia-07",
    "code": "C54",
    "floor": "5",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 77271,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d52",
    "projectId": "insignia-07",
    "code": "D52",
    "floor": "5",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 86299,
    "status": "Disponible",
    "features": [
      "Torre D",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c41",
    "projectId": "insignia-07",
    "code": "C41",
    "floor": "4",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 76342,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c42",
    "projectId": "insignia-07",
    "code": "C42",
    "floor": "4",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 75412,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c43",
    "projectId": "insignia-07",
    "code": "C43",
    "floor": "4",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 75412,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c44",
    "projectId": "insignia-07",
    "code": "C44",
    "floor": "4",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 76342,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d42",
    "projectId": "insignia-07",
    "code": "D42",
    "floor": "4",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 85224,
    "status": "Disponible",
    "features": [
      "Torre D",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c31",
    "projectId": "insignia-07",
    "code": "C31",
    "floor": "3",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 75412,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c32",
    "projectId": "insignia-07",
    "code": "C32",
    "floor": "3",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 74483,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d31",
    "projectId": "insignia-07",
    "code": "D31",
    "floor": "3",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 83074,
    "status": "Disponible",
    "features": [
      "Torre D",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d32",
    "projectId": "insignia-07",
    "code": "D32",
    "floor": "3",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 84149,
    "status": "Disponible",
    "features": [
      "Torre D",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c21",
    "projectId": "insignia-07",
    "code": "C21",
    "floor": "2",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 74793,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c22",
    "projectId": "insignia-07",
    "code": "C22",
    "floor": "2",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 73864,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c23",
    "projectId": "insignia-07",
    "code": "C23",
    "floor": "2",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 73864,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c24",
    "projectId": "insignia-07",
    "code": "C24",
    "floor": "2",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 74793,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d22",
    "projectId": "insignia-07",
    "code": "D22",
    "floor": "2",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 83433,
    "status": "Disponible",
    "features": [
      "Torre D",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c11",
    "projectId": "insignia-07",
    "code": "C11",
    "floor": "1",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 74173,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c12",
    "projectId": "insignia-07",
    "code": "C12",
    "floor": "1",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 73244,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c13",
    "projectId": "insignia-07",
    "code": "C13",
    "floor": "1",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 73244,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-c14",
    "projectId": "insignia-07",
    "code": "C14",
    "floor": "1",
    "type": "2 dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 10.9,
    "ownM2": 51.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 51.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 74173,
    "status": "Disponible",
    "features": [
      "Torre C",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  },
  {
    "id": "ig7-d12",
    "projectId": "insignia-07",
    "code": "D12",
    "floor": "1",
    "type": "2 + dormitorios",
    "bedrooms": 2,
    "areaLabel": "de departamento",
    "commonM2": 12.6,
    "ownM2": 59.1,
    "parking": 1,
    "parkingM2": 12.5,
    "patioM2": 0,
    "totalM2": 59.1,
    "balconyM2": -1,
    "currency": "USD",
    "price": 81641,
    "status": "Disponible",
    "features": [
      "Torre D",
      "1 cochera incluida",
      "Precio pozo según lista C/D; reconfirmar disponibilidad"
    ],
    "updatedAt": "2026-08-21"
  }
];

export function applyInventoryAudit(projects: Project[], units: Unit[]) {
 const byKey = new Map(units.map(unit => [unit.projectId + "/" + unit.code, unit]));
 for (const group of areaGroups) for (const code of group.codes) {
   const unit = byKey.get(group.projectId + "/" + code);
   if (unit) Object.assign(unit, group.fields);
 }
 for (const unit of addedUnits) if (!byKey.has(unit.projectId + "/" + unit.code)) units.push({ ...unit, features: [...unit.features] });
 for (const unit of units) if (/^(insignia-|terra-|city-)/.test(unit.projectId)) unit.type = unit.type.replace(/\s+X$/, "").replace(/(\d)(\++)dormitorios/, "$1 dormitorios $2");
 for (const project of projects) project.inventoryAudit = inventoryAudit[project.id];
 for (const project of projects.filter(p => p.developer === "Insignia / INVURSA")) {
   const audit = inventoryAudit[project.id];
   const [, month, day] = audit.reviewedAt.split("-");
   project.updatedAt = audit.reviewedAt;
   project.sourceDateLabel = `Lista revisada ${day}/${month}; vigencia no indicada`;
   project.summary = audit.checkedUnits + " unidades con precio en las listas revisadas. Superficie de departamento separada de patio, comunes y cochera. Precio pozo; disponibilidad sujeta a reconfirmación.";
 }
 const mood = projects.find(p => p.id === "mood-office");
 if (mood) mood.summary = "60 oficinas según la lista de julio de 2026: 68,5 o 116 m² de oficina con balcón; cocheras separadas del metraje. Precio del conjunto con cochera. Solicitar lista vigente.";
}
