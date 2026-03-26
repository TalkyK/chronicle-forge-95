export type Locale = "pt-BR" | "pt-PT" | "en" | "es" | "fr" | "de" | "ja" | "it";

export type MessageKey =
  | "header.brand"
  | "header.toggleTheme"
  | "notFound.message"
  | "notFound.backHome"
  | "newSheet.chooseType"
  | "newSheet.rpg"
  | "newSheet.story"
  | "newSheet.action.saveDraft"
  | "newSheet.action.saveSheet"
  | "newSheet.action.saveCharacter"
  | "newSheet.action.discard"
  | "nav.home"
  | "nav.grimoires"
  | "nav.arcaneOrder"
  | "nav.codex"
  | "catalog.heroTitle"
  | "catalog.heroDescription"
  | "catalog.newSheet"
  | "catalog.tabs.sheets"
  | "catalog.tabs.members"
  | "catalog.tabs.chat"
  | "catalog.tabs.settings"
  | "catalog.tabs.settingsShort"
  | "catalog.vault"
  | "catalog.mode.rpg"
  | "catalog.mode.story"
  | "catalog.membersTitle"
  | "catalog.membersCount"
  | "settings.backHome"
  | "settings.section"
  | "settings.panels.language"
  | "settings.panels.account"
  | "settings.panels.privacy"
  | "settings.panels.notifications"
  | "settings.panels.security"
  | "settings.desc.language"
  | "settings.desc.account"
  | "settings.desc.privacy"
  | "settings.desc.notifications"
  | "settings.desc.security"
  | "settings.language.interfaceTitle"
  | "settings.language.interfaceDesc"
  | "settings.language.save"
  | "settings.language.regionalTitle"
  | "settings.language.regionalDesc"
  | "login.title"
  | "login.username"
  | "login.usernamePlaceholder"
  | "login.password"
  | "login.passwordPlaceholder"
  | "login.rememberMe"
  | "login.forgotPassword"
  | "login.submit"
  | "login.noAccount"
  | "login.register"
  | "index.title"
  | "index.subtitle"
  | "index.sectionTitle"
  | "index.features.modes.title"
  | "index.features.modes.desc"
  | "index.features.flexible.title"
  | "index.features.flexible.desc"
  | "index.features.catalog.title"
  | "index.features.catalog.desc";

const ptBR: Record<MessageKey, string> = {
  "header.brand": "Roll & Tale",
  "header.toggleTheme": "Alternar tema",

  "notFound.message": "Ops! Página não encontrada",
  "notFound.backHome": "Voltar ao início",

  "newSheet.chooseType": "Escolha o tipo de ficha",
  "newSheet.rpg": "Ficha de RPG",
  "newSheet.story": "Ficha de Personagem",
  "newSheet.action.saveDraft": "Rascunho",
  "newSheet.action.saveSheet": "Salvar Ficha",
  "newSheet.action.saveCharacter": "Salvar Personagem",
  "newSheet.action.discard": "Descartar",

  "nav.home": "Início",
  "nav.grimoires": "Grimórios",
  "nav.arcaneOrder": "Ordem Arcana",
  "nav.codex": "Códice",

  "catalog.heroTitle": "Ordem dos Arcanos",
  "catalog.heroDescription":
    "Um santuário para quem busca verdades esquecidas. Nossa campanha atravessa os reinos fraturados de Eldoria, registrando cada feitiço, cicatriz e segredo encontrado ao longo do caminho astral.",
  "catalog.newSheet": "Nova ficha",
  "catalog.tabs.sheets": "Fichas",
  "catalog.tabs.members": "Membros",
  "catalog.tabs.chat": "Chat",
  "catalog.tabs.settings": "Configurações",
  "catalog.tabs.settingsShort": "Config.",
  "catalog.vault": "Cofre",
  "catalog.mode.rpg": "RPG",
  "catalog.mode.story": "História",
  "catalog.membersTitle": "Membros da Ordem",
  "catalog.membersCount": "12 integrantes ativos",

  "settings.backHome": "Voltar ao início",
  "settings.section": "Configurações",
  "settings.panels.language": "Idioma & Região",
  "settings.panels.account": "Informações da Conta",
  "settings.panels.privacy": "Dados & Privacidade",
  "settings.panels.notifications": "Notificações",
  "settings.panels.security": "Segurança",
  "settings.desc.language": "Escolha a língua em que os pergaminhos serão escritos",
  "settings.desc.account": "Seu perfil de aventureiro e credenciais de acesso",
  "settings.desc.privacy": "Controle o que compartilhamos e como seus dados são usados",
  "settings.desc.notifications": "Escolha quando e como receber avisos da guilda",
  "settings.desc.security": "Proteja sua conta e seus grimórios digitais",
  "settings.language.interfaceTitle": "Idioma da Interface",
  "settings.language.interfaceDesc": "A língua exibida em menus, fichas e mensagens do sistema",
  "settings.language.save": "Salvar idioma",
  "settings.language.regionalTitle": "Formato Regional",
  "settings.language.regionalDesc": "Configurações de data, hora e moeda exibidas nas fichas",

  "login.title": "Login",
  "login.username": "Usuário",
  "login.usernamePlaceholder": "Seu ID de conta",
  "login.password": "Senha",
  "login.passwordPlaceholder": "••••••••",
  "login.rememberMe": "Lembrar de mim",
  "login.forgotPassword": "Esqueci minha senha",
  "login.submit": "Entrar",
  "login.noAccount": "Não tem uma conta?",
  "login.register": "Criar conta",

  "index.title": "Gerador de Fichas",
  "index.subtitle": "Crie personagens para suas aventuras de RPG ou dê vida aos protagonistas das suas histórias.",
  "index.sectionTitle": "Seu grimório de personagens",
  "index.features.modes.title": "Dois Modos",
  "index.features.modes.desc": "Fichas técnicas de RPG ou fichas narrativas para escritores.",
  "index.features.flexible.title": "Flexível",
  "index.features.flexible.desc": "Atributos dinâmicos, templates de sistema e campos personalizáveis.",
  "index.features.catalog.title": "Catálogo",
  "index.features.catalog.desc": "Organize dezenas de personagens com filtros, tags e busca.",
};

const en: Partial<Record<MessageKey, string>> = {
  "header.brand": "Roll & Tale",
  "header.toggleTheme": "Toggle theme",

  "notFound.message": "Oops! Page not found",
  "notFound.backHome": "Return to Home",

  "newSheet.chooseType": "Choose the sheet type",
  "newSheet.rpg": "RPG Sheet",
  "newSheet.story": "Character Sheet",
  "newSheet.action.saveDraft": "Save Draft",
  "newSheet.action.saveSheet": "Save Sheet",
  "newSheet.action.saveCharacter": "Save Character",
  "newSheet.action.discard": "Discard",

  "nav.home": "Home",
  "nav.grimoires": "Grimoires",
  "nav.arcaneOrder": "Arcane Order",
  "nav.codex": "Codex",

  "catalog.heroTitle": "Arcane Order",
  "catalog.heroDescription":
    "A sanctum for those who seek forgotten truths. Our campaign travels the fractured realms of Eldoria, recording every spell, scar, and secret found along the astral path.",
  "catalog.newSheet": "New sheet",
  "catalog.tabs.sheets": "Sheets",
  "catalog.tabs.members": "Members",
  "catalog.tabs.chat": "Chat",
  "catalog.tabs.settings": "Settings",
  "catalog.tabs.settingsShort": "Settings",
  "catalog.vault": "Vault",
  "catalog.mode.rpg": "RPG",
  "catalog.mode.story": "Story",
  "catalog.membersTitle": "Order Members",
  "catalog.membersCount": "12 active members",

  "settings.backHome": "Back to home",
  "settings.section": "Settings",
  "settings.panels.language": "Language & Region",
  "settings.panels.account": "Account Info",
  "settings.panels.privacy": "Data & Privacy",
  "settings.panels.notifications": "Notifications",
  "settings.panels.security": "Security",
  "settings.desc.language": "Choose the language used across menus and sheets",
  "settings.desc.account": "Your profile and access credentials",
  "settings.desc.privacy": "Control what we share and how data is used",
  "settings.desc.notifications": "Choose when and how to receive alerts",
  "settings.desc.security": "Protect your account and digital grimoires",
  "settings.language.interfaceTitle": "Interface Language",
  "settings.language.interfaceDesc": "The language shown in menus, sheets, and system messages",
  "settings.language.save": "Save language",
  "settings.language.regionalTitle": "Regional Format",
  "settings.language.regionalDesc": "Date, time, and currency formats used in sheets",

  "login.title": "Login",
  "login.username": "Username",
  "login.usernamePlaceholder": "Your account ID",
  "login.password": "Password",
  "login.rememberMe": "Remember me",
  "login.forgotPassword": "Forgot password?",
  "login.submit": "Login",
  "login.noAccount": "Don't have an account?",
  "login.register": "Register account",

  "index.title": "Character Sheets",
  "index.subtitle": "Create RPG characters or bring story protagonists to life.",
  "index.sectionTitle": "Your character grimoire",
  "index.features.modes.title": "Two Modes",
  "index.features.modes.desc": "RPG sheets or narrative sheets for writers.",
  "index.features.flexible.title": "Flexible",
  "index.features.flexible.desc": "Dynamic attributes, system templates, and custom fields.",
  "index.features.catalog.title": "Catalog",
  "index.features.catalog.desc": "Organize characters with tags and search.",
};

const es: Partial<Record<MessageKey, string>> = {
  "header.brand": "Roll & Tale",
  "header.toggleTheme": "Cambiar tema",

  "notFound.message": "¡Ups! Página no encontrada",
  "notFound.backHome": "Volver al inicio",

  "newSheet.chooseType": "Elige el tipo de ficha",
  "newSheet.rpg": "Ficha de RPG",
  "newSheet.story": "Ficha de personaje",
  "newSheet.action.saveDraft": "Guardar borrador",
  "newSheet.action.saveSheet": "Guardar ficha",
  "newSheet.action.saveCharacter": "Guardar personaje",
  "newSheet.action.discard": "Descartar",

  "nav.home": "Inicio",
  "nav.grimoires": "Grimorios",
  "nav.arcaneOrder": "Orden Arcana",
  "nav.codex": "Códice",

  "catalog.newSheet": "Nueva ficha",
  "catalog.tabs.sheets": "Fichas",
  "catalog.tabs.members": "Miembros",
  "catalog.tabs.chat": "Chat",
  "catalog.tabs.settings": "Configuración",
  "catalog.tabs.settingsShort": "Config.",
  "catalog.vault": "Cofre",
  "catalog.mode.story": "Historia",

  "settings.backHome": "Volver al inicio",
  "settings.section": "Configuración",
  "settings.panels.language": "Idioma y región",
  "settings.panels.account": "Información de la cuenta",
  "settings.panels.privacy": "Datos y privacidad",
  "settings.panels.notifications": "Notificaciones",
  "settings.panels.security": "Seguridad",
  "settings.desc.language": "Elige el idioma usado en menús y fichas",
  "settings.desc.account": "Tu perfil y credenciales de acceso",
  "settings.desc.privacy": "Controla qué compartimos y cómo se usan tus datos",
  "settings.desc.notifications": "Elige cuándo y cómo recibir avisos",
  "settings.desc.security": "Protege tu cuenta y tus grimorios digitales",
  "settings.language.interfaceTitle": "Idioma de la interfaz",
  "settings.language.interfaceDesc": "El idioma mostrado en menús, fichas y mensajes del sistema",
  "settings.language.save": "Guardar idioma",
  "settings.language.regionalTitle": "Formato regional",
  "settings.language.regionalDesc": "Formatos de fecha, hora y moneda en las fichas",

  "login.username": "Usuario",
  "login.password": "Contraseña",
  "login.rememberMe": "Recordarme",
  "login.forgotPassword": "¿Olvidaste tu contraseña?",
  "login.submit": "Entrar",
  "login.register": "Crear cuenta",
};

export const messages: Record<Locale, Partial<Record<MessageKey, string>>> = {
  "pt-BR": ptBR,
  "pt-PT": ptBR,
  en,
  es,
  fr: en,
  de: en,
  ja: en,
  it: en,
};

export function translate(locale: Locale, key: MessageKey): string {
  return (
    messages[locale]?.[key] ??
    messages["pt-BR"]?.[key] ??
    messages.en?.[key] ??
    key
  );
}
