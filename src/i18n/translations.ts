export type SupportedLang = 'zh_tw' | 'zh_cn' | 'en' | 'ja' | 'es' | 'pt';

export interface TranslationStrings {
  gameTitle: string;
  gameSubtitle: string;
  langLabel: string;
  hp: string;
  stamina: string;
  astral: string;
  controls: string;
  controlsShort: string;
  bossName: string;
  bossSubtitle: string;
  victoryTitle: string;
  victoryDesc: string;
  defeatTitle: string;
  defeatDesc: string;
  restartBtn: string;
  soundOn: string;
  soundOff: string;
  fullscreen: string;
  howToPlay: string;
  helpTitle: string;
  helpClose: string;
  lore: string;
  timeSurvived: string;
  enemiesDefeated: string;
  tips: string;
  touchControlsHint: string;
  counterHit: string;
  bossStaggered: string;
}

export const i18nData: Record<SupportedLang, TranslationStrings> = {
  zh_tw: {
    gameTitle: "烏羽裁決：界碑試煉",
    gameSubtitle: "類魂 2D 斜視角動作試煉",
    langLabel: "語言選擇",
    hp: "生命核心",
    stamina: "閃避耐力",
    astral: "星幽秘能",
    controls: "WASD: 疾行位移 | 空白鍵: 幽影翻滾(無敵幀) | 滑鼠左鍵: 裁決斬 / 蓄力重斬 | 滑鼠右鍵: 幽芒飛刃",
    controlsShort: "WASD 移動 | 空白鍵 翻滾 | 左鍵 輕/重斬 | 右鍵 飛刃",
    bossName: "鎮魂方碑傀儡",
    bossSubtitle: "遠古遺碑守護神",
    victoryTitle: "【禁制已破】",
    victoryDesc: "你擊碎了鎮魂方碑，完成了渡鴉裁決之試煉！古神界碑化為塵埃，神聖之火重燃。",
    defeatTitle: "【羽翼碎裂】",
    defeatDesc: "你的實體在古界碑前湮滅，靈魄歸於虛無。試煉在此中斷，靈體尚待重聚。",
    restartBtn: "重聚靈體 (重新挑戰)",
    soundOn: "音效：開啟",
    soundOff: "音效：靜音",
    fullscreen: "全螢幕切換",
    howToPlay: "操作指南",
    helpTitle: "《烏羽裁決》作戰指南",
    helpClose: "重返試煉",
    lore: "你是背負古烏羽誓約的裁決使者，深入幽暗迷津，挑戰鎮守界碑的遠古巨械。",
    timeSurvived: "戰鬥時間",
    enemiesDefeated: "消滅目標",
    tips: "秘訣：成功翻滾閃避 Boss 攻擊後的 500ms 內反擊，觸發「失衡破綻」造成 1.5 倍傷害！石柱可阻擋衝撞。",
    touchControlsHint: "觸控螢幕已啟用虛擬搖桿與技能按鈕",
    counterHit: "【破綻暴擊 1.5x】",
    bossStaggered: "【失衡狀態】"
  },
  zh_cn: {
    gameTitle: "乌羽裁决：界碑试炼",
    gameSubtitle: "类魂 2D 斜视角动作试炼",
    langLabel: "语言选择",
    hp: "生命核心",
    stamina: "闪避耐力",
    astral: "星幽秘能",
    controls: "WASD: 疾行位移 | 空格键: 幽影翻滚(无敌帧) | 鼠标左键: 裁决斩 / 蓄力重斩 | 鼠标右键: 幽芒飞刃",
    controlsShort: "WASD 移动 | 空格键 翻滚 | 左键 轻/重斩 | 右键 飞刃",
    bossName: "镇魂方碑傀儡",
    bossSubtitle: "远古遗碑守护神",
    victoryTitle: "【禁制已破】",
    victoryDesc: "你击碎了镇魂方碑，完成了渡鸦裁决之试炼！古神界碑化为尘埃，神圣之火重燃。",
    defeatTitle: "【羽翼碎裂】",
    defeatDesc: "你的实体在古界碑前湮灭，灵魄归于虚无。试炼在此中断，灵体尚待重聚。",
    restartBtn: "重聚灵体 (重新挑战)",
    soundOn: "音效：开启",
    soundOff: "音效：静音",
    fullscreen: "全屏切换",
    howToPlay: "操作指南",
    helpTitle: "《乌羽裁决》作战指南",
    helpClose: "重返试炼",
    lore: "你是背负古乌羽誓约的裁决使者，深入幽暗迷津，挑战镇守界碑的远古巨械。",
    timeSurvived: "战斗时间",
    enemiesDefeated: "消灭目标",
    tips: "秘诀：成功翻滚闪避 Boss 攻击后的 500ms 内反击，触发「失衡破绽」造成 1.5 倍伤害！石柱可阻挡冲撞。",
    touchControlsHint: "触控屏幕已启用虚拟摇杆与技能按键",
    counterHit: "【破绽暴击 1.5x】",
    bossStaggered: "【失衡状态】"
  },
  en: {
    gameTitle: "Raven's Verdict: The Boundary Trial",
    gameSubtitle: "Isometric Souls-like 2D Combat Trial",
    langLabel: "Language",
    hp: "HP Core",
    stamina: "Dodge Stamina",
    astral: "Astral Energy",
    controls: "WASD: Move | Space: Shadow Roll (i-frames) | LMB: Slash / Charged Strike | RMB: Astral Dagger",
    controlsShort: "WASD Move | Space Roll | LMB Slash / Charge | RMB Dagger",
    bossName: "Monolith Sentinel",
    bossSubtitle: "Guardian of the Ancient Boundary",
    victoryTitle: "SEAL SHATTERED!",
    victoryDesc: "You destroyed the Monolith Sentinel and fulfilled the Arbiter's Trial! The ancient boundary dissolves into dust.",
    defeatTitle: "WINGS BROKEN",
    defeatDesc: "Your physical form dissolved before the ancient boundary. The spirit returns to the silent void.",
    restartBtn: "Reconverge Spirit (Restart)",
    soundOn: "Sound: On",
    soundOff: "Sound: Muted",
    fullscreen: "Toggle Fullscreen",
    howToPlay: "How to Play",
    helpTitle: "Combat Manual",
    helpClose: "Return to Trial",
    lore: "As the Arbiter of the Raven Oath, breach the forbidden subterranean sanctuary and overcome the titanic Monolith.",
    timeSurvived: "Survival Time",
    enemiesDefeated: "Targets Slain",
    tips: "Tip: Strike within 500ms of dodging a Boss attack to trigger Stagger Vulnerability for 1.5x damage! Pillars block charges.",
    touchControlsHint: "Touch screen mode: virtual joystick and action buttons enabled.",
    counterHit: "COUNTER STRIKE 1.5x!",
    bossStaggered: "STAGGERED!"
  },
  ja: {
    gameTitle: "ワタリガラスの判決：境界の試練",
    gameSubtitle: "ソウルライク 2.5D クォータービューアクション",
    langLabel: "言語設定",
    hp: "生命の核",
    stamina: "回避スタミナ",
    astral: "星幽エネルギー",
    controls: "WASD: 移動 | スペース: 影の回避(無敵時間) | 左クリック: 裁きの斬撃 / 溜め斬り | 右クリック: 幽芒の刃",
    controlsShort: "WASD 移動 | スペース 回避 | 左クリック 斬撃/溜め | 右クリック 飛刃",
    bossName: "鎮魂のモノリス・ゴーレム",
    bossSubtitle: "古代境界を守護する巨神",
    victoryTitle: "【結界崩壊】",
    victoryDesc: "鎮魂のモノリスを打ち砕き、ワタリガラスの試練を果たした！古の結界は崩れ去り、光が満ちる。",
    defeatTitle: "【翼の散華】",
    defeatDesc: "境界の前にて肉体は崩壊し、魂は虚無へと還った。試練は途絶え、再起を待つ。",
    restartBtn: "魂の再構築 (リトライ)",
    soundOn: "音効：有効",
    soundOff: "音効：消音",
    fullscreen: "全画面切り替え",
    howToPlay: "操作手引",
    helpTitle: "戦闘心得",
    helpClose: "試練に戻る",
    lore: "ワタリガラスの誓いを背負いし裁定者よ、地下の聖域を穿ち、古の番兵を討ち払え。",
    timeSurvived: "戦闘時間",
    enemiesDefeated: "撃破数",
    tips: "助言：ボスの攻撃を回避直後の500ms以内に反撃すると「体勢崩し」で1.5倍の特効ダメージ！石柱は突進を防ぎます。",
    touchControlsHint: "タッチ操作：仮想ジョイスティックとアクションボタンが有効です",
    counterHit: "【隙あり特効 1.5x】",
    bossStaggered: "【体勢崩し】"
  },
  es: {
    gameTitle: "El Veredicto del Cuervo: La Prueba del Límite",
    gameSubtitle: "Prueba de Combate Isométrica Souls-like 2D",
    langLabel: "Idioma",
    hp: "Núcleo de Vida",
    stamina: "Aguante de Evasión",
    astral: "Poder Astral",
    controls: "WASD: Movimiento | Espacio: Esquive Sombrío (i-frames) | Clic Izq: Tajo / Tajo Cargado | Clic Der: Daga Astral",
    controlsShort: "WASD Mover | Espacio Esquivar | Clic Izq Corte/Carga | Clic Der Daga",
    bossName: "Centinela del Monolito",
    bossSubtitle: "Guardián de la Frontera Ancestral",
    victoryTitle: "¡SELLO ROTO!",
    victoryDesc: "¡Has destruido al Centinela del Monolito y superado la Prueba del Árbitro! El límite antiguo se desmorona.",
    defeatTitle: "ALAS ROTAS",
    defeatDesc: "Tu forma física se ha desvanecido ante el límite ancestral. Tu alma regresa al vacío infinito.",
    restartBtn: "Recomponer Espíritu (Reiniciar)",
    soundOn: "Sonido: Activado",
    soundOff: "Sonido: Silencio",
    fullscreen: "Pantalla Completa",
    howToPlay: "Guía de Combate",
    helpTitle: "Manual del Árbitro",
    helpClose: "Volver a la Prueba",
    lore: "Portador del Juramento del Cuervo, adéntrate en el santuario prohibido y desafía al titán de piedra.",
    timeSurvived: "Tiempo de Batalla",
    enemiesDefeated: "Enemigos Vencidos",
    tips: "Consejo: ¡Ataca dentro de los 500ms tras esquivar un ataque del jefe para asestar un Contraataque Vulnerable del 1.5x! Los pilares bloquean embestidas.",
    touchControlsHint: "Pantalla táctil activa con joystick y botones virtuales.",
    counterHit: "¡CONTRAATAQUE 1.5x!",
    bossStaggered: "¡DESESTABILIZADO!"
  },
  pt: {
    gameTitle: "O Veredito do Corvo: O Julgamento do Limite",
    gameSubtitle: "Desafio de Combate Isométrico Souls-like 2D",
    langLabel: "Idioma",
    hp: "Núcleo de Vida",
    stamina: "Estamina de Esquiva",
    astral: "Energia Astral",
    controls: "WASD: Movimento | Espaço: Rolamento Sombrio (i-frames) | Botão Esq: Corte / Golpe Carregado | Botão Dir: Adaga Astral",
    controlsShort: "WASD Mover | Espaço Esquivar | Botão Esq Corte/Carga | Botão Dir Adaga",
    bossName: "Sentinela do Monólito",
    bossSubtitle: "Guardião da Fronteira Ancestral",
    victoryTitle: "SELO QUEBRADO!",
    victoryDesc: "Você destruiu a Sentinela do Monólito e completou o Julgamento do Árbitro! O limite antigo ruiu.",
    defeatTitle: "ASAS QUEBRADAS",
    defeatDesc: "Sua forma corpórea dissolveu-se diante do limite primordial. O espírito regressa ao abismo.",
    restartBtn: "Reconvergir Espírito (Reiniciar)",
    soundOn: "Som: Ativado",
    soundOff: "Som: Mudo",
    fullscreen: "Tela Cheia",
    howToPlay: "Manual de Jogo",
    helpTitle: "Guia do Árbitro",
    helpClose: "Retornar ao Desafio",
    lore: "Sob o Juramento do Corvo, desça ao santuário esquecido e derrote a titânica Sentinela.",
    timeSurvived: "Tempo em Combate",
    enemiesDefeated: "Inimigos Derrotados",
    tips: "Dica: Ataque em até 500ms após esquivar de um golpe do chefe para ativar o estado Desestabilizado e causar 1.5x de dano! Pilares absorvem investidas.",
    touchControlsHint: "Controles táteis na tela ativados.",
    counterHit: "CONTRA-ATAQUE 1.5x!",
    bossStaggered: "DESESTABILIZADO!"
  }
};
