/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Longest-first string replacements so shorter patterns do not clobber longer ones.
 * @param {string} text
 * @param {Array<[string, string]>} pairs
 */
function applyReplacements(text, pairs) {
  let out = text;
  const longestFirst = [...pairs].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of longestFirst) {
    if (from === '') continue;
    out = out.split(from).join(to);
  }
  return out;
}

/** French: textbook-style keywords + common phrases (algorithm names stay recognizable). */
const FR_PAIRS = [
  [
    'randomly shuffle all elements of array',
    'mélanger au hasard tous les éléments du tableau',
  ],
  ['array is not sorted', 'le tableau n’est pas trié'],
  ['there is more than one run', 'il reste plus d’une séquence fusionnable'],
  [
    'merge adjacent runs pairwise in stable order using merge from merge sort',
    'fusionner deux à deux les séquences adjacentes de façon stable (fusion du tri fusion)',
  ],
  [
    'sort each short run with insertion sort',
    'trier chaque courte séquence par tri par insertion',
  ],
  [
    'split array into consecutive runs of at least minRun elements (natural runs if already ordered)',
    'découper le tableau en séquences consécutives d’au moins minRun éléments (séquences naturelles si déjà ordonnées)',
  ],
  [
    'compute minimum run length from length of array',
    'calculer la longueur minimale de séquence à partir de la longueur du tableau',
  ],
  ['length of sortedArray', 'longueur de sortedArray'],
  ['length of array', 'longueur du tableau'],
  [
    'FOR each neighbor of current that is inside grid and walkable and not visited',
    'POUR chaque voisin du nœud courant dans la grille, praticable et non visité',
  ],
  ['empty queue', 'file vide'],
  ['empty stack', 'pile vide'],
  ['empty lists (digits 0–9)', 'listes vides (chiffres 0–9)'],
  ['empty lists', 'listes vides'],
  ['empty list', 'liste vide'],
  ['priority queue', 'file de priorité'],
  ['dequeue front', 'défiler en tête'],
  ['mark start as visited', 'marquer le départ comme visité'],
  ['mark neighbor as visited', 'marquer le voisin comme visité'],
  ['mark neighbor visited', 'marquer le voisin visité'],
  [
    'record parent of neighbor as current',
    'enregistrer le parent du voisin comme courant',
  ],
  [
    'reconstructed from parent pointers',
    'reconstruit via les pointeurs parent',
  ],
  ['path from parent pointers', 'chemin via les pointeurs parent'],
  ['shortest path', 'plus court chemin'],
  [
    'shortest path tree from parent pointers',
    'arbre de plus courts chemins via les parents',
  ],
  ['negative cycle', 'cycle négatif'],
  ['no path', 'aucun chemin'],
  ['not found', 'introuvable'],
  ['not empty', 'non vide'],
  ['not locally consistent', 'pas localement cohérent'],
  ['first of left', 'premier de gauche'],
  ['first of right', 'premier de droite'],
  ['remaining elements of array', 'éléments restants du tableau'],
  ['first mid elements of array', 'première moitié d’éléments du tableau'],
  ['each value in array', 'chaque valeur du tableau'],
  ['each x in array', 'chaque x du tableau'],
  ['each neighbor of current', 'chaque voisin du nœud courant'],
  [
    'each unvisited neighbor of current',
    'chaque voisin non visité du nœud courant',
  ],
  ['each bucket', 'chaque seau'],
  ['each edge (u, v) with weight w', 'chaque arête (u, v) de poids w'],
  [
    'each child of node with step cost c',
    'chaque enfant du nœud avec coût d’étape c',
  ],
  ['each direction from current', 'chaque direction depuis le courant'],
  [
    'all nodes with tentative distance infinity except start',
    'tous les nœuds à distance provisoire infinie sauf le départ',
  ],
  ['remove current from queue', 'retirer le courant de la file'],
  ['remove current from openSet', 'retirer le courant de openSet'],
  [
    'update neighbor position in priority queue',
    'mettre à jour la position du voisin dans la file de priorité',
  ],
  [
    'add or update neighbor in openSet',
    'ajouter ou mettre à jour le voisin dans openSet',
  ],
  [
    'parents from start and from goal tables initialized',
    'tables parent depuis départ et depuis objectif initialisées',
  ],
  [
    'expand one step from the smaller frontier',
    'étendre d’un pas depuis la frontière la plus petite',
  ],
  [
    'any node appears in both visited sets',
    'un nœud apparaît dans les deux ensembles visités',
  ],
  [
    'RETURN path by joining parent chains from meeting point',
    'RETOURNER le chemin en joignant les chaînes parent depuis le point de rencontre',
  ],
  ['estimated cost to goal', 'coût estimé vers l’objectif'],
  [
    'step cost from current to neighbor',
    'coût d’étape du courant vers le voisin',
  ],
  [
    'inside grid and walkable and not visited',
    'dans la grille, praticable et non visité',
  ],
  ['enqueue neighbor', 'enfiler le voisin'],
  ['enqueue start', 'enfiler le départ'],
  ['enqueue start into openSet', 'enfiler le départ dans openSet'],
  ['push start onto stack', 'empiler le départ sur la pile'],
  ['push neighbor onto stack', 'empiler le voisin sur la pile'],
  ['pop stack', 'dépiler'],
  ['dequeue smallest h', 'défiler le plus petit h'],
  ['best jump point', 'meilleur saut'],
  ['add start as a jump point', 'ajouter le départ comme point de saut'],
  [
    'JUMP in that direction until wall or forced neighbor or goal',
    'SAUT dans cette direction jusqu’à un mur, un voisin forcé ou l’objectif',
  ],
  [
    'current can see goal along straight or diagonal line without obstacles',
    'le courant voit l’objectif en ligne droite ou diagonale sans obstacle',
  ],
  [
    'record parent and enqueue jump point with updated g and h',
    'enregistrer le parent et enfiler le saut avec g et h mis à jour',
  ],
  ['path via jump points and parents', 'chemin via les sauts et les parents'],
  ['number of nodes − 1', 'nombre de nœuds − 1'],
  ['filled with zeros', 'rempli de zéros'],
  ['minimum of array', 'minimum du tableau'],
  ['maximum value in array', 'valeur maximale du tableau'],
  ['sort bucket with a simple sort', 'trier le seau avec un tri simple'],
  [
    'concatenate buckets in order into array',
    'concaténer les seaux dans l’ordre dans le tableau',
  ],
  [
    'rewrite array in order from buckets 0 through 9',
    'réécrire le tableau dans l’ordre des seaux 0 à 9',
  ],
  ['append value to buckets[digit]', 'ajouter la valeur au seau[digit]'],
  [
    'append any leftover elements from left and right',
    'ajouter les éléments restants de gauche et de droite',
  ],
  [
    'append first of left to result and advance left',
    'ajouter le premier de gauche au résultat et avancer gauche',
  ],
  [
    'append first of right to result and advance right',
    'ajouter le premier de droite au résultat et avancer droite',
  ],
  ['floor square root of n', 'partie entière de la racine carrée de n'],
  [
    'BinarySearch on sortedArray[low..high] for target',
    'BinarySearch sur sortedArray[low..high] pour la cible',
  ],
  [
    'compare target with element at probe index using Fibonacci step sizes',
    'comparer la cible à l’élément à l’index sonde avec des pas de Fibonacci',
  ],
  [
    'narrow window using previous Fibonacci numbers',
    'rétrécir la fenêtre avec les nombres de Fibonacci précédents',
  ],
  [
    'use Fibonacci numbers to shrink a window [offset, offset + Fk] over the array',
    'utiliser les nombres de Fibonacci pour rétrécir une fenêtre [offset, offset + Fk] sur le tableau',
  ],
  [
    'compute smallest Fibonacci number Fk ≥ length of array',
    'calculer le plus petit nombre de Fibonacci Fk ≥ longueur du tableau',
  ],
  ['there is a window to inspect', 'il reste une fenêtre à examiner'],
  ['in adjacency order', 'dans l’ordre d’adjacence'],
  [
    'initialize goal-centric g and rhs values for all vertices',
    'initialiser g et rhs centrés sur l’objectif pour tous les sommets',
  ],
  [
    'INSERT goal into priority queue with consistent key',
    'INSÉRER l’objectif dans la file de priorité avec clé cohérente',
  ],
  [
    "process vertex with smallest key and update neighbors' rhs from predecessors",
    'traiter le sommet de plus petite clé et mettre à jour rhs des voisins depuis les prédécesseurs',
  ],
  [
    'extract path toward goal following decreasing g along edges',
    'extraire le chemin vers l’objectif en suivant g décroissant le long des arêtes',
  ],
  [
    'update affected rhs values and fix queue keys',
    'mettre à jour rhs affectés et corriger les clés de file',
  ],
  [
    'repeat compute shortest path prefix until start is consistent again',
    'répéter le préfixe de plus court chemin jusqu’à cohérence du départ',
  ],
  ['current best path', 'meilleur chemin courant'],
  ['result is a path', 'le résultat est un chemin'],
  ['result is infinity', 'le résultat est infini'],
  ['path found', 'chemin trouvé'],
  [
    'childResult is a number and childResult < minNext',
    'childResult est un nombre et childResult < minNext',
  ],
  ['REPORT negative cycle', 'SIGNALER un cycle négatif'],
  ['END LOOP', 'FIN BOUCLE'],
  ['LOOP:', 'BOUCLE :'],
  ['CONTINUE', 'CONTINUER'],
  ['SWAP', 'ÉCHANGER'],
  ['REPEAT', 'RÉPÉTER'],
  ['WHILE', 'TANT QUE'],
  ['ELSE', 'SINON'],
  ['ELSE IF', 'SINON SI'],
  ['FUNCTION', 'FONCTION'],
  ['RETURN', 'RETOURNER'],
  ['FOR ', 'POUR '],
  [' IF ', ' SI '],
  ['\n  IF ', '\n  SI '],
  ['\n    IF ', '\n    SI '],
  [' AND ', ' ET '],
  [' OR ', ' OU '],
  [' FROM ', ' DE '],
  [' TO ', ' À '],
  [' DOWNTO ', ' EN DESCENDANT JUSQU’À '],
];

/** Arabic: keywords and frequent phrases; identifiers like array[i] stay Latin for readability. */
const AR_PAIRS = [
  [
    'randomly shuffle all elements of array',
    'اخلط جميع عناصر المصفوفة عشوائياً',
  ],
  ['array is not sorted', 'المصفوفة غير مرتبة'],
  ['there is more than one run', 'ما زال هناك أكثر من دفعة واحدة'],
  [
    'merge adjacent runs pairwise in stable order using merge from merge sort',
    'ادمج الدفعات المجاورة زوجياً بشكل ثابت (دمج من دمج ترتيب الدمج)',
  ],
  [
    'sort each short run with insertion sort',
    'رتب كل دفعة قصيرة بترتيب الإدراج',
  ],
  [
    'split array into consecutive runs of at least minRun elements (natural runs if already ordered)',
    'اقسم المصفوفة إلى دفعات متتالية من minRun عناصر على الأقل (دفعات طبيعية إن كانت مرتبة مسبقاً)',
  ],
  [
    'compute minimum run length from length of array',
    'احسب الحد الأدنى لطول الدفعة من طول المصفوفة',
  ],
  ['length of sortedArray', 'طول sortedArray'],
  ['length of array', 'طول المصفوفة'],
  [
    'FOR each neighbor of current that is inside grid and walkable and not visited',
    'من أجل كل جار للعقدة الحالية داخل الشبكة وقابل للمشي وغير مُزار',
  ],
  ['empty queue', 'طابور فارغ'],
  ['empty stack', 'مكدس فارغ'],
  ['empty lists (digits 0–9)', 'قوائم فارغة (الأرقام 0–9)'],
  ['empty lists', 'قوائم فارغة'],
  ['empty list', 'قائمة فارغة'],
  ['priority queue', 'طابور أولويات'],
  ['dequeue front', 'أزل من مقدمة الطابور'],
  ['mark start as visited', 'علّم البداية كمُزار'],
  ['mark neighbor as visited', 'علّم الجار كمُزار'],
  ['mark neighbor visited', 'علّم الجار مُزاراً'],
  ['record parent of neighbor as current', 'سجّل أب الجار كالعقدة الحالية'],
  ['reconstructed from parent pointers', 'مُعاد بناؤه من مؤشرات الأب'],
  ['path from parent pointers', 'المسار من مؤشرات الأب'],
  ['shortest path', 'أقصر مسار'],
  [
    'shortest path tree from parent pointers',
    'شجرة أقصر مسارات من مؤشرات الأب',
  ],
  ['negative cycle', 'دورة سالبة'],
  ['no path', 'لا يوجد مسار'],
  ['not found', 'غير موجود'],
  ['not empty', 'غير فارغ'],
  ['not locally consistent', 'غير متسق محلياً'],
  ['first of left', 'أول اليسار'],
  ['first of right', 'أول اليمين'],
  ['remaining elements of array', 'بقية عناصر المصفوفة'],
  ['first mid elements of array', 'أول نصف عناصر المصفوفة'],
  ['each value in array', 'كل قيمة في المصفوفة'],
  ['each x in array', 'كل x في المصفوفة'],
  ['each neighbor of current', 'كل جار للعقدة الحالية'],
  ['each unvisited neighbor of current', 'كل جار غير مُزار للعقدة الحالية'],
  ['each bucket', 'كل دلو'],
  ['each edge (u, v) with weight w', 'كل حافة (u, v) بوزن w'],
  ['each child of node with step cost c', 'كل ابن للعقدة بتكلفة خطوة c'],
  ['each direction from current', 'كل اتجاه من الحالية'],
  [
    'all nodes with tentative distance infinity except start',
    'كل العقد بمسافة مؤقتة لانهائية ما عدا البداية',
  ],
  ['remove current from queue', 'أزل الحالية من الطابور'],
  ['remove current from openSet', 'أزل الحالية من openSet'],
  [
    'update neighbor position in priority queue',
    'حدّث موضع الجار في طابور الأولويات',
  ],
  ['add or update neighbor in openSet', 'أضف أو حدّث الجار في openSet'],
  [
    'parents from start and from goal tables initialized',
    'جداول الأب من البداية والهدف مهيأة',
  ],
  ['expand one step from the smaller frontier', 'وسّع خطوة من الحدّ الأصغر'],
  ['any node appears in both visited sets', 'ظهور عقدة في مجموعتي الزيارة'],
  [
    'RETURN path by joining parent chains from meeting point',
    'أرجع المسار بربط سلاسل الأب من نقطة اللقاء',
  ],
  ['estimated cost to goal', 'تكلفة مقدرة للهدف'],
  ['step cost from current to neighbor', 'تكلفة خطوة من الحالية للجار'],
  [
    'inside grid and walkable and not visited',
    'داخل الشبكة وقابل للمشي وغير مُزار',
  ],
  ['enqueue neighbor', 'أدرج الجار'],
  ['enqueue start', 'أدرج البداية'],
  ['enqueue start into openSet', 'أدرج البداية في openSet'],
  ['push start onto stack', 'ادفع البداية إلى المكدس'],
  ['push neighbor onto stack', 'ادفع الجار إلى المكدس'],
  ['pop stack', 'ازل من المكدس'],
  ['dequeue smallest h', 'أزل أصغر h'],
  ['best jump point', 'أفضل نقطة قفز'],
  ['add start as a jump point', 'أضف البداية كنقطة قفز'],
  [
    'JUMP in that direction until wall or forced neighbor or goal',
    'اقفز في ذلك الاتجاه حتى جدار أو جار إجباري أو هدف',
  ],
  [
    'current can see goal along straight or diagonal line without obstacles',
    'الحالية ترى الهدف بخط مستقيم أو قطري بلا عوائق',
  ],
  [
    'record parent and enqueue jump point with updated g and h',
    'سجّل الأب وأدرج نقطة القفز ب g و h محدثين',
  ],
  ['path via jump points and parents', 'المسار عبر نقاط القفز والآباء'],
  ['number of nodes − 1', 'عدد العقد − 1'],
  ['filled with zeros', 'معبأ بالأصفار'],
  ['minimum of array', 'أدنى قيمة في المصفوفة'],
  ['maximum value in array', 'أقصى قيمة في المصفوفة'],
  ['sort bucket with a simple sort', 'رتب الدلو بترتيب بسيط'],
  [
    'concatenate buckets in order into array',
    'اربط الدلاء بالترتيب في المصفوفة',
  ],
  [
    'rewrite array in order from buckets 0 through 9',
    'أعد كتابة المصفوفة بالترتيب من الدلاء 0 إلى 9',
  ],
  ['append value to buckets[digit]', 'ألحق القيمة بالدلو المطابق للرقم'],
  [
    'append any leftover elements from left and right',
    'ألحق العناصر المتبقية من اليسار واليمين',
  ],
  [
    'append first of left to result and advance left',
    'ألحق أول اليسار بالنتيجة وتقدّم يساراً',
  ],
  [
    'append first of right to result and advance right',
    'ألحق أول اليمين بالنتيجة وتقدّم يميناً',
  ],
  ['floor square root of n', 'جزء صحيح من الجذر التربيعي لـ n'],
  [
    'BinarySearch on sortedArray[low..high] for target',
    'BinarySearch على sortedArray[low..high] للهدف',
  ],
  [
    'compare target with element at probe index using Fibonacci step sizes',
    'قارن الهدف مع العنصر عند فهرس المسبار بخطوات فيبوناتشي',
  ],
  [
    'narrow window using previous Fibonacci numbers',
    'ضيّق النافذة بأرقام فيبوناتشي السابقة',
  ],
  [
    'use Fibonacci numbers to shrink a window [offset, offset + Fk] over the array',
    'استخدم أرقام فيبوناتشي لتصغير نافذة [offset, offset + Fk] على المصفوفة',
  ],
  [
    'compute smallest Fibonacci number Fk ≥ length of array',
    'احسب أصغر رقم فيبوناتشي Fk ≥ طول المصفوفة',
  ],
  ['there is a window to inspect', 'توجد نافذة للفحص'],
  ['in adjacency order', 'بترتيب الجوار'],
  [
    'initialize goal-centric g and rhs values for all vertices',
    'هيئ قيم g و rhs مركزة على الهدف لجميع الرؤوس',
  ],
  [
    'INSERT goal into priority queue with consistent key',
    'أدرج الهدف في طابور أولويات بمفتاح متسق',
  ],
  [
    "process vertex with smallest key and update neighbors' rhs from predecessors",
    'عالج الرأس بأصغر مفتاح وحدّث rhs للجيران من السابقين',
  ],
  [
    'extract path toward goal following decreasing g along edges',
    'استخرج المسار نحو الهدف باتباع g تنازلياً على الحواف',
  ],
  [
    'update affected rhs values and fix queue keys',
    'حدّث قيم rhs المتأثرة وأصلح مفاتيح الطابور',
  ],
  [
    'repeat compute shortest path prefix until start is consistent again',
    'كرر حساب بادئة أقصر مسار حتى تصبح البداية متسقة مجدداً',
  ],
  ['current best path', 'أفضل مسار حالي'],
  ['result is a path', 'النتيجة مسار'],
  ['result is infinity', 'النتيجة لانهاية'],
  ['path found', 'مسار موجود'],
  [
    'childResult is a number and childResult < minNext',
    'childResult عدد و childResult < minNext',
  ],
  ['REPORT negative cycle', 'أبلغ عن دورة سالبة'],
  ['PARTITION', 'تقسيم'],
  ['left and right are not empty', 'اليسار واليمين غير فارغين'],
  [
    'array of length maxValue + 1 filled with zeros',
    'مصفوفة بطول maxValue + 1 معبأة بالأصفار',
  ],
  ['maximum of array', 'أقصى قيمة في المصفوفة'],
  ['append x to buckets[bucketIndex]', 'ألحق x بـ buckets[bucketIndex]'],
  ['queue is not empty', 'الطابور غير فارغ'],
  ['node in queue with smallest distance', 'العقدة في الطابور ذات أصغر مسافة'],
  [
    'each neighbor of current with edge weight w',
    'كل جار للعقدة الحالية بوزن حافة w',
  ],
  ['priority queue ordered by f = g + h', 'طابور أولويات مرتب حسب f = g + h'],
  ['node in openSet with smallest f', 'العقدة في openSet ذات أصغر f'],
  ['queue containing start', 'طابور يحتوي البداية'],
  ['queue containing goal', 'طابور يحتوي الهدف'],
  ['both frontiers are not empty', 'الحدّان كلاهما غير فارغين'],
  ['priority queue ordered by h only', 'طابور أولويات مرتب حسب h فقط'],
  [
    'enqueue neighbor with priority heuristic(neighbor, goal)',
    'أدرج الجار بأولوية heuristic(neighbor, goal)',
  ],
  [
    'priority queue of jump points by f = g + h',
    'طابور أولويات لنقاط القفز حسب f = g + h',
  ],
  ['jump is valid', 'القفزة صالحة'],
  ['distance[all nodes] ← infinity', 'distance[كل العقد] ← لانهاية'],
  [
    'queue not empty and start not locally consistent',
    'الطابور غير فارغ والبداية غير متسقة محلياً',
  ],
  ['robot moves along plan', 'الروبوت يتحرك على الخطة'],
  ['edge costs change', 'تغيّرت تكاليف الحواف'],
  ['first element = target', 'العنصر الأول = الهدف'],
  ['stack is not empty', 'المكدس غير فارغ'],
  ['neighbor not visited', 'الجار غير مُزار'],
  ['node is null', 'العقدة فارغة'],
  ['left child of node', 'الابن الأيسر للعقدة'],
  ['right child of node', 'الابن الأيمن للعقدة'],
  ['visit node', 'زُر العقدة'],
  ['visit current', 'زُر الحالية'],
  [
    'To traverse the whole binary tree, call',
    'لاجتياز الشجرة الثنائية كاملة، استدعِ',
  ],
  ['root is null', 'الجذر فارغ'],
  ['enqueue root', 'أدرج الجذر'],
  ['current has left child', 'للحالية ابن أيسر'],
  ['current has right child', 'للحالية ابن أيمن'],
  ['enqueue left child', 'أدرج الابن الأيسر'],
  ['enqueue right child', 'أدرج الابن الأيمن'],
  ['left child', 'الابن الأيسر'],
  ['right child', 'الابن الأيمن'],
  ['deque with root', 'طابور مزدوج يحتوي الجذر'],
  ['length of queue', 'طول الطابور'],
  ['count times', 'count مرة'],
  ['append dequeue-left(queue) to level', 'ألحق dequeue-left(queue) بـ level'],
  ['// spatial left → right order', '// ترتيب مكاني من اليسار إلى اليمين'],
  ['reverse level', 'اعكس level'],
  [
    '// scan right → left this depth',
    '// امسح من اليمين إلى اليسار في هذا العمق',
  ],
  ['each node in level', 'كل عقدة في level'],
  ['each node in spatialOrder(level)', 'كل عقدة في spatialOrder(level)'],
  [
    '// rebuild next frontier left → right',
    '// أعد بناء الحد التالي من اليسار إلى اليمين',
  ],
  ['node has left child', 'للعقدة ابن أيسر'],
  ['node has right child', 'للعقدة ابن أيمن'],
  ['// alternate next depth', '// بدّل الاتجاه في العمق التالي'],
  [
    'Uses two scans per depth: zigzag visitation order, then spatial enqueue so the next level stays correct.',
    'يستخدم مسحين لكل عمق: ترتيب الزيارة المتعرج، ثم إدراج مكاني ليبقى المستوى التالي صحيحاً.',
  ],
  ['current is not null', 'الحالية ليست فارغة'],
  ['left child of current is null', 'الابن الأيسر للحالية فارغ'],
  ['right child of current', 'الابن الأيمن للحالية'],
  ['left child of current', 'الابن الأيسر للحالية'],
  ['pred has right child', 'لـ pred ابن أيمن'],
  ['right child of pred is null', 'الابن الأيمن لـ pred فارغ'],
  ['right child of pred', 'الابن الأيمن لـ pred'],
  ['temporarily set', 'اضبط مؤقتاً'],
  ['// thread', '// ربط'],
  ['// unthread', '// فك الربط'],
  ['restore ', 'استعد '],
  [
    'Uses only O(1) extra space; restores original tree links after the walk.',
    'يستخدم مساحة إضافية O(1) فقط، ويستعيد روابط الشجرة الأصلية بعد الاجتياز.',
  ],
  ['empty set', 'مجموعة فارغة'],
  ['empty map', 'خريطة فارغة'],
  ['vertex is in temporary', 'الرأس في temporary'],
  ['REPORT cycle and stop', 'أبلغ عن دورة وتوقف'],
  ['REPORT cycle', 'أبلغ عن دورة'],
  ['vertex is in permanent', 'الرأس في permanent'],
  ['add vertex to temporary', 'أضف الرأس إلى temporary'],
  ['each neighbor in adjacency[vertex]', 'كل جار في adjacency[vertex]'],
  ['remove vertex from temporary', 'أزل الرأس من temporary'],
  ['add vertex to permanent', 'أضف الرأس إلى permanent'],
  ['push vertex onto finishStack', 'ادفع الرأس إلى finishStack'],
  ['each vertex in graph', 'كل رأس في الرسم البياني'],
  ['vertex is not in permanent', 'الرأس ليس في permanent'],
  ['map with 0 for every vertex', 'خريطة بقيمة 0 لكل رأس'],
  ['all vertices with inDegree 0', 'كل الرؤوس ذات inDegree 0'],
  ['append vertex to order', 'ألحق الرأس بـ order'],
  ['length(order) ≠ number of vertices', 'length(order) ≠ عدد الرؤوس'],
  ['make each vertex its own component', 'اجعل كل رأس مكوّناً مستقلاً'],
  ['sort edges by ascending weight', 'رتب الحواف تصاعدياً حسب الوزن'],
  [
    'each edge (u, v, w) in sorted edges',
    'كل حافة (u, v, w) في الحواف المرتبة',
  ],
  ['add edge to selectedEdges', 'أضف الحافة إلى selectedEdges'],
  [
    'skip edge because it would create a cycle',
    'تخطَّ الحافة لأنها ستُنشئ دورة',
  ],
  [
    'priority queue of edges leaving start',
    'طابور أولويات للحواف الخارجة من البداية',
  ],
  ['frontier is not empty', 'frontier غير فارغ'],
  ['not all vertices are visited', 'ليست كل الرؤوس مُزارة'],
  [
    'extract minimum-weight edge from frontier',
    'استخرج الحافة الأقل وزناً من frontier',
  ],
  ['edge.to is already visited', 'edge.to مُزار مسبقاً'],
  ['mark edge.to as visited', 'علّم edge.to كمُزار'],
  [
    'push every outgoing edge from edge.to to an unvisited vertex into frontier',
    'ادفع كل حافة خارجة من edge.to نحو رأس غير مُزار إلى frontier',
  ],
  ['push vertex onto stack', 'ادفع الرأس إلى المكدس'],
  ['add vertex to onStack', 'أضف الرأس إلى onStack'],
  ['neighbor is not in indices', 'الجار ليس في indices'],
  ['neighbor is in onStack', 'الجار في onStack'],
  ['remove node from onStack', 'أزل العقدة من onStack'],
  ['append node to component', 'ألحق العقدة بـ component'],
  ['append component to components', 'ألحق component بـ components'],
  ['vertex is not in indices', 'الرأس ليس في indices'],
  ['mark vertex visited', 'علّم الرأس مُزاراً'],
  ['neighbor is not visited', 'الجار غير مُزار'],
  ['append vertex to finishStack', 'ألحق الرأس بـ finishStack'],
  ['vertex is not visited', 'الرأس غير مُزار'],
  ['graph with every edge reversed', 'الرسم البياني مع عكس كل حافة'],
  ['append vertex to component', 'ألحق الرأس بـ component'],
  ['each neighbor in transpose[vertex]', 'كل جار في transpose[vertex]'],
  ['each vertex in reverse(finishStack)', 'كل رأس في reverse(finishStack)'],
  ['matrix filled with ∞', 'مصفوفة معبأة بـ ∞'],
  ['matrix filled with null', 'مصفوفة معبأة بـ null'],
  ['each vertex i', 'كل رأس i'],
  ['each directed edge (u, v, w)', 'كل حافة موجهة (u, v, w)'],
  ['each intermediate vertex k', 'كل رأس وسيط k'],
  ['each source vertex i', 'كل رأس مصدر i'],
  ['each destination vertex j', 'كل رأس وجهة j'],
  ['any dist[i][i] < 0', 'أي dist[i][i] < 0'],
  ['UNTIL', 'حتى'],
  ['NOT ', 'ليس '],
  ['IF ', 'إذا '],
  ['END LOOP', 'نهاية الحلقة'],
  ['LOOP:', 'حلقة:'],
  ['CONTINUE', 'تابع'],
  ['SWAP', 'تبادل'],
  ['REPEAT', 'كرر'],
  ['WHILE', 'طالما'],
  ['ELSE', 'وإلا'],
  ['ELSE IF', 'وإلا إذا'],
  ['FUNCTION', 'دالة'],
  ['RETURN', 'أرجع'],
  ['FOR ', 'من أجل '],
  [' IF ', ' إذا '],
  ['\n  IF ', '\n  إذا '],
  ['\n    IF ', '\n    إذا '],
  [' AND ', ' و '],
  [' OR ', ' أو '],
  [' FROM ', ' من '],
  [' TO ', ' إلى '],
  [' DOWNTO ', ' نزولاً إلى '],
];

/**
 * @param {Record<string, string>} enMap
 * @param {'fr' | 'ar'} locale
 * @returns {Record<string, string>}
 */
export function localizePseudocodeMap(enMap, locale) {
  if (locale === 'fr') {
    return Object.fromEntries(
      Object.entries(enMap).map(([k, v]) => [k, applyReplacements(v, FR_PAIRS)])
    );
  }
  if (locale === 'ar') {
    return Object.fromEntries(
      Object.entries(enMap).map(([k, v]) => [k, applyReplacements(v, AR_PAIRS)])
    );
  }
  return { ...enMap };
}
