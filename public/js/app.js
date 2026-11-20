(function () {
  'use strict';

  angular
    .module('coralKingdom', [])
    .factory('MailStore', MailStore)
    .factory('AlertStore', AlertStore)
    .controller('GameCtrl', GameCtrl)
    .controller('MessagesCtrl', MessagesCtrl)
    .controller('AlertsCtrl', AlertsCtrl)
    .controller('SettingsCtrl', SettingsCtrl)
    .controller('RewardsCtrl', RewardsCtrl)
    .controller('SpinCtrl', SpinCtrl)
    .controller('RankingCtrl', RankingCtrl)
    .controller('SearchCtrl', SearchCtrl)
    .controller('SquadCtrl', SquadCtrl)
    .controller('RadarCtrl', RadarCtrl)
    .controller('AllianceCtrl', AllianceCtrl)
    .controller('ComposeMessageCtrl', ComposeMessageCtrl)
    .controller('ChatCtrl', ChatCtrl)
    .controller('BuildCtrl', BuildCtrl)
    .controller('MoveCtrl', MoveCtrl)
    .controller('TeleportCtrl', TeleportCtrl)
    .directive('hexField', hexFieldDirective);

  /** Shared inbox sample data (no backend). */
  function MailStore() {
    var items = [
      {
        id: 'm1',
        from: 'AquaAdmin',
        preview:
          'Welcome to Coral Kingdom! Claim your starter scrap crate before the next tick resets inventory slots…',
        body:
          'Welcome to Coral Kingdom!\n\nClaim your starter scrap crate before the next tick resets inventory slots. Visit the north reef flats and tap the glowing clam to collect.\n\nFair winds,\nAquaAdmin',
        time: '2m ago',
        unread: true,
      },
      {
        id: 'm2',
        from: 'ReefRunner',
        preview: 'Trade offer: 40 fish for 2 energy cells — reply if interested.',
        body:
          'Hey CaptainShelly,\n\nTrade offer: 40 fish for 2 energy cells — reply if interested. I can meet at the mid-octagon sand bar.\n\n— ReefRunner',
        time: '18m ago',
        unread: false,
      },
      {
        id: 'm3',
        from: 'ShellGuild',
        preview:
          'Alliance briefing: patrol the eastern shallows tonight. Watch for marauder skiffs near the water rim…',
        body:
          'Alliance briefing\n\nPatrol the eastern shallows tonight. Watch for marauder skiffs near the water rim and ping Radar if you spot flares.\n\nRally mark is already on your minimap.\n\n— ShellGuild Officers',
        time: '1h ago',
        unread: true,
      },
      {
        id: 'm4',
        from: 'TickBot',
        preview: 'Next server maintenance window: tomorrow 03:00 UTC (approx. 12 ticks).',
        body:
          'Scheduled notice\n\nNext server maintenance window: tomorrow 03:00 UTC (approx. 12 ticks).\n\nLand pan state will be preserved. Mail and alliance chat may briefly pause.\n\n— TickBot',
        time: 'Yesterday',
        unread: false,
      },
    ];

    var nextId = 5;

    return {
      items: items,
      hasUnread: function () {
        var i;
        for (i = 0; i < items.length; i += 1) {
          if (items[i].unread) {
            return true;
          }
        }
        return false;
      },
      markRead: function (item) {
        if (item) {
          item.unread = false;
        }
      },
      /** Prepend a mail (alliance announcements, system, etc.). */
      add: function (mail) {
        if (!mail) {
          return null;
        }
        nextId += 1;
        var entry = {
          id: mail.id || 'm' + nextId,
          from: mail.from || 'Alliance',
          preview: mail.preview || '',
          body: mail.body || mail.preview || '',
          time: mail.time || 'Just now',
          unread: mail.unread !== false,
        };
        items.unshift(entry);
        return entry;
      },
    };
  }

  /** Territory alert sample data (no backend). */
  function AlertStore() {
    var nextId = 5;
    var items = [
      {
        id: 'a1',
        kind: 'battle',
        title: 'Shell Radar 1 lost',
        preview: 'John conquered your Shell Radar 1',
        reportTitle: 'Battle Report — Shell Radar 1',
        reportBody:
          'Battle Report stub\n\nAttacker: John\nDefender: CaptainShelly\nTerritory: Shell Radar 1\n\nOutcome: Territory conquered.\nCasualties and loot details coming soon.',
        time: '4m ago',
        unread: true,
      },
      {
        id: 'a2',
        kind: 'battle',
        title: 'North Clam Flat held',
        preview: 'Marauder skiff failed to take your North Clam Flat',
        reportTitle: 'Battle Report — North Clam Flat',
        reportBody:
          'Battle Report stub\n\nAttacker: Marauder Skiff\nDefender: CaptainShelly\nTerritory: North Clam Flat\n\nOutcome: Defense held.\nFull combat log placeholder.',
        time: '22m ago',
        unread: true,
      },
      {
        id: 'a3',
        kind: 'battle',
        title: 'Reef Gate claimed',
        preview: 'You conquered Reef Gate from TideRaider',
        reportTitle: 'Battle Report — Reef Gate',
        reportBody:
          'Battle Report stub\n\nAttacker: CaptainShelly\nDefender: TideRaider\nTerritory: Reef Gate\n\nOutcome: Territory claimed.\nStats placeholder.',
        time: '2h ago',
        unread: false,
      },
      {
        id: 'a4',
        kind: 'battle',
        title: 'Scout Tower scouted',
        preview: 'Enemy scouts spotted near your Scout Tower',
        reportTitle: 'Battle Report — Scout Tower',
        reportBody:
          'Battle Report stub\n\nEvent: Territory scouted\nTerritory: Scout Tower\n\nNo battle fought. Scout contact logged.\nPlaceholder intel panel.',
        time: 'Yesterday',
        unread: false,
      },
    ];

    return {
      items: items,
      hasUnread: function () {
        var i;
        for (i = 0; i < items.length; i += 1) {
          if (items[i].unread) {
            return true;
          }
        }
        return false;
      },
      markRead: function (item) {
        if (item) {
          item.unread = false;
        }
      },
      add: function (item) {
        if (!item) {
          return null;
        }
        nextId += 1;
        var entry = angular.extend(
          {
            id: 'a' + nextId,
            kind: 'battle',
            time: 'Just now',
            unread: true,
          },
          item
        );
        items.unshift(entry);
        return entry;
      },
    };
  }

  function GameCtrl($interval, $scope, MailStore, AlertStore) {
    var vm = this;

    vm.BUILD_COST = 300;
    vm.SCAN_COST = 10; // energy per Scan
    // Teleport: chemicals = squads × 10 × original distance ticks; arrives in 1 tick
    vm.TELEPORT_COST_PER = 10;
    vm.TELEPORT_TICKS = 1;
    vm.SQUAD_MAX_UNITS = 15;
    // Combat: base life by fish role
    vm.FISH_HP = { flying: 15, sword: 30, puffer: 60 };
    // Type chart: armoured < shock < toxic < armoured
    vm.TYPE_BEATS = {
      shock: 'armoured',
      toxic: 'shock',
      armoured: 'toxic',
    };
    vm.TICK_RESOURCE = 10;
    vm.TICK_FISH = 1;
    vm.VIP_TICK_BONUS = 10; // extra +10 to every resource per tick when VIP
    vm.vip = false;
    vm.ownCoralReef = null; // { col, row } once own Coral Reef is placed
    vm.resourceAmounts = {
      scrap: 1250,
      flask: 840,
      energy: 620,
      fish: 340,
    };
    vm.resources = [
      { id: 'scrap', label: 'Scrap', value: '0', icon: 'scrap' },
      { id: 'flask', label: 'Green flask', value: '0', icon: 'flask' },
      { id: 'energy', label: 'Energy', value: '0', icon: 'energy' },
      { id: 'fish', label: 'Fish', value: '0', icon: 'fish' },
    ];

    function syncResourceDisplay() {
      var i;
      var id;
      for (i = 0; i < vm.resources.length; i += 1) {
        id = vm.resources[i].id;
        vm.resources[i].value = formatAmount(vm.resourceAmounts[id] || 0);
      }
    }

    syncResourceDisplay();

    vm.getResource = function (id) {
      return vm.resourceAmounts[id] || 0;
    };

    vm.spendScrap = function (amount) {
      var cost = amount || 0;
      if ((vm.resourceAmounts.scrap || 0) < cost) {
        return false;
      }
      vm.resourceAmounts.scrap -= cost;
      syncResourceDisplay();
      return true;
    };

    /** Deduct several resources at once. costs: { scrap, flask, energy, fish } */
    vm.spendResources = function (costs) {
      var need = costs || {};
      var ids = ['scrap', 'flask', 'energy', 'fish'];
      var i;
      var id;
      var amount;
      for (i = 0; i < ids.length; i += 1) {
        id = ids[i];
        amount = need[id] || 0;
        if (amount > 0 && (vm.resourceAmounts[id] || 0) < amount) {
          return false;
        }
      }
      for (i = 0; i < ids.length; i += 1) {
        id = ids[i];
        amount = need[id] || 0;
        if (amount > 0) {
          vm.resourceAmounts[id] -= amount;
        }
      }
      syncResourceDisplay();
      return true;
    };

    /** Add resources and refresh the header HUD. gains: { scrap, flask, energy, fish } */
    vm.grantResources = function (gains) {
      var add = gains || {};
      var ids = ['scrap', 'flask', 'energy', 'fish'];
      var i;
      var id;
      var amount;
      for (i = 0; i < ids.length; i += 1) {
        id = ids[i];
        amount = Number(add[id]) || 0;
        if (amount) {
          vm.resourceAmounts[id] = (vm.resourceAmounts[id] || 0) + amount;
        }
      }
      syncResourceDisplay();
    };

    vm.syncResources = function () {
      syncResourceDisplay();
    };

    /** Progress squad builds — 1 fish unit = 1 tick. */
    vm.advanceBuilding = function () {
      var list = vm.squads || [];
      var i;
      var s;
      for (i = 0; i < list.length; i += 1) {
        s = list[i];
        if (!s || s.state !== 'building') {
          continue;
        }
        if (s.ticks > 0) {
          s.ticks -= 1;
        }
        if (s.ticks <= 0) {
          s.state = 'idle';
          s.ticks = 0;
          if (!s.location) {
            s.location = 'Coral Reef 1';
          }
          if (s.col == null && vm.ownCoralReef && vm.ownCoralReef.col != null) {
            s.col = vm.ownCoralReef.col;
            s.row = vm.ownCoralReef.row;
          }
        }
      }
    };

    vm.grantTickIncome = function () {
      var bonus = vm.vip ? vm.VIP_TICK_BONUS : 0;
      vm.resourceAmounts.scrap += vm.TICK_RESOURCE + bonus;
      vm.resourceAmounts.flask += vm.TICK_RESOURCE + bonus;
      vm.resourceAmounts.energy += vm.TICK_RESOURCE + bonus;
      // Population: +1 fish base; VIP adds +10 more
      vm.resourceAmounts.fish += vm.TICK_FISH + bonus;
      syncResourceDisplay();
    };

    vm.hasOwnCoralReef = function () {
      return !!vm.ownCoralReef;
    };

    vm.markOwnCoralReef = function (col, row) {
      if (col != null && row != null) {
        vm.ownCoralReef = { col: String(col), row: String(row) };
      } else {
        vm.ownCoralReef = true;
      }
    };

    /** Pan the land stage to a hex cell (set by hexField). */
    vm.focusMapCell = null;
    /** Pan to absolute map pixel (set by hexField). */
    vm.focusMapPoint = null;

    vm.focusHomeReef = function () {
      var reef = vm.ownCoralReef;
      if (reef && reef.col != null && reef.row != null) {
        if (typeof vm.focusMapCell === 'function') {
          vm.focusMapCell(reef.col, reef.row);
        }
        return true;
      }
      // Seed fallback before / without a placed reef marker
      if (typeof vm.focusMapCell === 'function') {
        vm.focusMapCell(49, 5);
        return true;
      }
      return false;
    };

    /** Resolve a squad's current view target (cell or map point). */
    vm.squadViewTarget = function (squad) {
      if (!squad) {
        return null;
      }
      if (squad.state === 'travelling' && squad.routeId && vm.travel) {
        var routes = vm.travel.routes || [];
        var i;
        var r;
        for (i = 0; i < routes.length; i += 1) {
          r = routes[i];
          if (r && r.id === squad.routeId && r.origin && r.pinned) {
            var t = r.progress != null ? r.progress : 0;
            if (t < 0) {
              t = 0;
            }
            if (t > 1) {
              t = 1;
            }
            var hw = (vm.hexMap && vm.hexMap.hexW) || 84;
            var hh = (vm.hexMap && vm.hexMap.hexH) || 96;
            return {
              x: r.origin.left + (r.pinned.left - r.origin.left) * t + hw / 2,
              y: r.origin.top + (r.pinned.top - r.origin.top) * t + hh / 2,
            };
          }
        }
        if (squad.destCol != null && squad.destRow != null) {
          return { col: squad.destCol, row: squad.destRow };
        }
      }
      if (squad.col != null && squad.row != null) {
        return { col: squad.col, row: squad.row };
      }
      return null;
    };

    vm.focusSquad = function (squad) {
      var target = vm.squadViewTarget(squad);
      var selCol;
      var selRow;
      if (!target) {
        return false;
      }
      if (target.x != null && target.y != null) {
        if (typeof vm.focusMapPoint === 'function') {
          vm.focusMapPoint(target.x, target.y);
        }
        // Travelling: keep camera on the squad, select dest (or current) cell
        selCol = squad.destCol != null ? squad.destCol : squad.col;
        selRow = squad.destRow != null ? squad.destRow : squad.row;
        if (
          selCol != null &&
          selRow != null &&
          typeof vm.selectMapCell === 'function'
        ) {
          vm.selectMapCell(selCol, selRow);
        }
        return true;
      }
      if (target.col != null && target.row != null) {
        if (typeof vm.focusMapCell === 'function') {
          vm.focusMapCell(target.col, target.row);
          return true;
        }
      }
      return false;
    };

    vm.tickSeconds = 40;
    vm.tickNumber = 127;
    vm.tickLabel = formatTick(vm.tickSeconds, vm.tickNumber);
    vm.captain = { name: 'CaptainShelly' };
    vm.notifications = 3;
    vm.chatTab = 'global';
    vm.chatMessage = 'AquaAdmin: Server reset in 10 minutes.';
    vm.nav = 'radar';
    vm.mailOpen = false;
    vm.composeOpen = false;
    vm.composeTarget = null; // { name, col, row, owner }
    vm.statsOpen = false;
    vm.statsTarget = null; // null = self; else { name, vip, owner, col, row, ... }
    vm.countOwnStructures = null; // set by hexField
    vm.countStructuresForReef = null; // set by hexField
    vm.sumGarrisonForReef = null; // set by hexField
    vm.alertsOpen = false;
    vm.settingsOpen = false;
    vm.rewardsOpen = false;
    vm.spinOpen = false;
    // Daily login streak — lives on GameCtrl so claims survive panel open/close
    vm.dailyLogin = {
      week: 1,
      currentDay: 3, // sample: mid-week today
      days: [
        { id: 'd1', day: 1, kind: 'scrap', label: 'Scraps', amount: 10, claimed: true },
        { id: 'd2', day: 2, kind: 'flask', label: 'Chemicals', amount: 5, claimed: true },
        { id: 'd3', day: 3, kind: 'energy', label: 'Energy', amount: 8, claimed: false },
        { id: 'd4', day: 4, kind: 'scrap', label: 'Scraps', amount: 15, claimed: false },
        { id: 'd5', day: 5, kind: 'flask', label: 'Chemicals', amount: 8, claimed: false },
        { id: 'd6', day: 6, kind: 'energy', label: 'Energy', amount: 12, claimed: false },
        { id: 'd7', day: 7, kind: 'scrap', label: 'Scraps', amount: 25, claimed: false },
      ],
    };
    /** Clear all claims and start a new week (day 1). */
    vm.resetDailyLoginWeek = function () {
      var i;
      var days = (vm.dailyLogin && vm.dailyLogin.days) || [];
      for (i = 0; i < days.length; i += 1) {
        days[i].claimed = false;
      }
      vm.dailyLogin.week = (vm.dailyLogin.week || 1) + 1;
      vm.dailyLogin.currentDay = 1;
    };
    // Daily Lucky Spin — one spin per day (persists across panel open/close)
    vm.dailySpin = {
      usedToday: false,
      resultId: null,
      rotation: 0,
    };
    vm.resetDailySpin = function () {
      vm.dailySpin.usedToday = false;
      vm.dailySpin.resultId = null;
      vm.dailySpin.rotation = 0;
    };
    vm.rankingOpen = false;
    vm.searchOpen = false;
    vm.squadOpen = false;
    vm.radarOpen = false;
    vm.allianceOpen = false;
    vm.chatOpen = false;
    vm.buildOpen = false;
    vm.buildTarget = null; // { col, row, left, top }
    vm.moveOpen = false;
    vm.moveTarget = null; // { col, row, left, top, buildingId, siteLabel }
    vm.teleportOpen = false;
    vm.teleportTarget = null; // origin sand tunnel cell
    vm.tutorialOpen = false;
    vm.tutorialStep = 0;
    vm.tutorialSteps = [
      {
        id: 'resources',
        title: 'Collect Resources and Daily Rewards',
        blurb:
          'Tap the chest and spin for daily loot. Scraps, chemicals, energy, and population fuel your reef empire.',
      },
      {
        id: 'build',
        title: 'Build Structures',
        blurb:
          'Claim empty sand hexes. Raise Shell Radars, Sand Tunnels, and more to expand your territory.',
      },
      {
        id: 'armies',
        title: 'Build Armies',
        blurb:
          'Train Flying Fish, Swordfish, and Pufferfish. Mix Armoured, Shock, and Toxic for the type triangle.',
      },
      {
        id: 'move',
        title: 'Move armies',
        blurb:
          'Blue = your friendly moves. Red = attacks involving you. Orange = other players moving elsewhere (warning only).',
      },
      {
        id: 'rank',
        title: 'Rank Up!',
        blurb:
          'Grow your score with structures and fish. Climb Current Era rankings and rule the coral kingdom.',
      },
    ];
    vm.placeBuilding = null; // set by hexField directive
    vm.listSandTunnels = null; // set by hexField directive
    // Shared squad roster (Squad panel + Move panel)
    // Own Coral Reef @ 49,5 — several idle squads for multi-move testing
    // Own Shell Radar @ 50,5
    vm.squads = [
      {
        id: 's1',
        name: 'Reef Raiders',
        state: 'idle',
        location: 'Coral Reef 1',
        col: 49,
        row: 5,
        ticks: 0,
        total: 12,
      },
      {
        id: 's2',
        name: 'Shell Guard',
        state: 'idle',
        location: 'Coral Reef 1',
        col: 49,
        row: 5,
        ticks: 0,
        total: 8,
      },
      {
        id: 's3',
        name: 'Tide Breakers',
        state: 'idle',
        location: 'Coral Reef 1',
        col: 49,
        row: 5,
        ticks: 0,
        total: 15,
      },
      {
        id: 's4',
        name: 'Pearl Scouts',
        state: 'idle',
        location: 'Coral Reef 1',
        col: 49,
        row: 5,
        ticks: 0,
        total: 6,
      },
      {
        id: 's5',
        name: 'Clam Crushers',
        state: 'idle',
        location: 'Coral Reef 1',
        col: 49,
        row: 5,
        ticks: 0,
        total: 10,
      },
      {
        id: 's6',
        name: 'Kelp Lancers',
        state: 'idle',
        location: 'Shell Radar 1',
        col: 50,
        row: 5,
        ticks: 0,
        total: 9,
      },
      {
        id: 's7',
        name: 'Depth Divers',
        state: 'building',
        ticks: 15,
        ticksTotal: 15,
        total: 15,
        col: 49,
        row: 5,
        location: 'Coral Reef 1',
      },
      {
        id: 's8',
        name: 'Tunnel Runners',
        state: 'idle',
        location: 'Sand Tunnel 1',
        col: 51,
        row: 5,
        ticks: 0,
        total: 7,
      },
    ];
    vm.nextSquadId = 9;
    // Travel: one preview + many committed routes (multi-squad / multi-target)
    vm.travel = {
      active: false, // picking destination (cursor follow)
      kind: null, // preview kind: 'attack' | 'move'
      origin: null,
      squadIds: [],
      pinned: null,
      ticks: 0, // preview tick estimate
      // Confirmed in-flight routes — each keeps its own curve + stingray
      routes: [],
      // { id, kind, origin, pinned, squadIds, ticksTotal, ticksLeft, progress, facingDeg, owned }
      selectedRouteId: null, // owned in-flight squad selection
    };
    vm.nextRouteId = 1;
    vm.travelConfirmOpen = false;
    vm.travelConfirm = null; // { kind: 'attack'|'move', dest, ticks, label }

    function clearMapSelectionSafe() {
      if (typeof vm.clearMapSelection === 'function') {
        vm.clearMapSelection();
      }
    }

    function clearTravelSelectionSafe() {
      if (vm.travel) {
        vm.travel.selectedRouteId = null;
      }
      if (typeof vm.clearTravelSelection === 'function') {
        vm.clearTravelSelection();
      }
    }
    vm.mailStore = MailStore;
    vm.alertStore = AlertStore;

    // Dense continuous sand field (pointy-top hex packing)
    vm.hexMap = {
      cols: 100,
      rows: 100,
      hexW: 84,
      hexH: 96,
    };

    vm.setChatTab = function (tab) {
      vm.chatTab = tab === 'alliance' ? 'alliance' : 'global';
      vm.chatMessage =
        vm.chatTab === 'alliance'
          ? '[AQA] CaptainShelly: Rally at the clam beds next tick.'
          : 'AquaAdmin: Server reset in 10 minutes.';
    };

    vm.openChat = function () {
      closeAllPanels();
      vm.chatOpen = true;
    };

    vm.closeChat = function () {
      vm.chatOpen = false;
    };

    vm.setNav = function (id) {
      vm.nav = id;
      if (id === 'squad') {
        closeAllPanels();
        vm.squadOpen = true;
        vm.nav = 'squad';
      } else if (id === 'radar') {
        closeAllPanels();
        vm.radarOpen = true;
        vm.nav = 'radar';
      } else if (id === 'alliance') {
        closeAllPanels();
        vm.allianceOpen = true;
        vm.nav = 'alliance';
      }
    };

    vm.closeSquad = function () {
      vm.squadOpen = false;
    };

    vm.closeRadar = function () {
      vm.radarOpen = false;
    };

    vm.closeAlliance = function () {
      vm.allianceOpen = false;
    };

    vm.openBuild = function (target) {
      closeAllPanels();
      vm.buildTarget = target || null;
      vm.buildOpen = true;
    };

    vm.closeBuild = function () {
      vm.buildOpen = false;
      vm.buildTarget = null;
    };

    vm.openMove = function (target) {
      closeAllPanels();
      vm.moveTarget = target || null;
      vm.moveOpen = true;
    };

    vm.closeMove = function () {
      vm.moveOpen = false;
      vm.moveTarget = null;
    };

    vm.openTeleport = function (target) {
      closeAllPanels();
      vm.teleportTarget = target || null;
      vm.teleportOpen = true;
    };

    vm.closeTeleport = function () {
      vm.teleportOpen = false;
      vm.teleportTarget = null;
    };

    vm.openTutorial = function () {
      closeAllPanels();
      vm.tutorialStep = 0;
      vm.tutorialOpen = true;
    };

    vm.closeTutorial = function () {
      vm.tutorialOpen = false;
      vm.tutorialStep = 0;
    };

    vm.tutorialCurrent = function () {
      return vm.tutorialSteps[vm.tutorialStep] || vm.tutorialSteps[0];
    };

    vm.tutorialIsLast = function () {
      return vm.tutorialStep >= vm.tutorialSteps.length - 1;
    };

    vm.tutorialNext = function () {
      if (vm.tutorialIsLast()) {
        vm.closeTutorial();
        return;
      }
      vm.tutorialStep += 1;
    };

    vm.tutorialPrev = function () {
      if (vm.tutorialStep > 0) {
        vm.tutorialStep -= 1;
      }
    };

    /** Odd-row offset → cube hex distance (same as map travel). */
    vm.hexDistance = function (c1, r1, c2, r2) {
      var col1 = Number(c1);
      var row1 = Number(r1);
      var col2 = Number(c2);
      var row2 = Number(r2);
      var x1 = col1 - (row1 - (row1 & 1)) / 2;
      var z1 = row1;
      var y1 = -x1 - z1;
      var x2 = col2 - (row2 - (row2 & 1)) / 2;
      var z2 = row2;
      var y2 = -x2 - z2;
      return Math.max(
        Math.abs(x1 - x2),
        Math.abs(y1 - y2),
        Math.abs(z1 - z2)
      );
    };

    vm.travelTicksBetween = function (c1, r1, c2, r2) {
      return Math.max(1, Math.round(vm.hexDistance(c1, r1, c2, r2)));
    };

    /**
     * Teleport chemical cost: squads × TELEPORT_COST_PER × original distance ticks.
     * Example: 5 squads, 3 ticks away → 5 × 10 × 3 = 150.
     */
    vm.teleportCost = function (squadCount, distanceTicks) {
      var n = Math.max(0, Number(squadCount) || 0);
      var t = Math.max(1, Number(distanceTicks) || 1);
      return n * (vm.TELEPORT_COST_PER || 10) * t;
    };

    /** Start tunnel-warp aim (curve preview) — like beginTravel, kind stays teleport. */
    vm.beginTeleport = function (squadIds, origin) {
      if (!origin || !squadIds || !squadIds.length) {
        return false;
      }
      // Exact cost needs destination distance; afford check happens on confirm
      vm.teleportOpen = false;
      vm.moveOpen = false;
      vm.moveTarget = null;
      vm.travelConfirmOpen = false;
      vm.travelConfirm = null;
      vm.travel.kind = 'teleport';
      vm.travel.active = true;
      vm.travel.origin = {
        col: origin.col,
        row: origin.row,
        left: origin.left,
        top: origin.top,
        siteLabel: origin.siteLabel || '',
        owner: origin.owner || null,
        buildingId: origin.buildingId || 'sand-tunnel',
      };
      vm.travel.squadIds = squadIds.slice();
      vm.travel.pinned = null;
      vm.travel.ticks = vm.TELEPORT_TICKS || 1;
      vm.travel.distanceTicks = 0;
      return true;
    };

    vm.squadsAtCell = function (col, row) {
      var c = String(col);
      var r = String(row);
      return (vm.squads || []).filter(function (s) {
        return (
          s &&
          s.state === 'idle' &&
          String(s.col) === c &&
          String(s.row) === r
        );
      });
    };

    /** Fish stationed on a cell (idle + building). Travelling do not count. */
    vm.fishCountAtCell = function (col, row) {
      var c = String(col);
      var r = String(row);
      var sum = 0;
      var i;
      var s;
      var key;
      var units;
      for (i = 0; i < (vm.squads || []).length; i += 1) {
        s = vm.squads[i];
        if (!s || String(s.col) !== c || String(s.row) !== r) {
          continue;
        }
        if (s.state === 'travelling') {
          continue;
        }
        if (s.total != null && s.total > 0) {
          sum += Number(s.total) || 0;
          continue;
        }
        units = s.units || {};
        for (key in units) {
          if (Object.prototype.hasOwnProperty.call(units, key)) {
            sum += units[key] || 0;
          }
        }
      }
      return sum;
    };

    /** Display size for a squad, e.g. "5/15". */
    vm.squadSizeLabel = function (squad) {
      var max = vm.SQUAD_MAX_UNITS || 15;
      var n = 0;
      var key;
      if (!squad) {
        return '0/' + max;
      }
      if (squad.total != null) {
        n = Number(squad.total) || 0;
      } else if (squad.units) {
        for (key in squad.units) {
          if (Object.prototype.hasOwnProperty.call(squad.units, key)) {
            n += squad.units[key] || 0;
          }
        }
      }
      return n + '/' + max;
    };

    /** Scan a structure → spend energy, then unread Scan Report with fish count. */
    vm.scanStructure = function (info) {
      if (!info || !AlertStore || typeof AlertStore.add !== 'function') {
        return null;
      }
      var cost = vm.SCAN_COST || 10;
      if (!vm.spendResources || !vm.spendResources({ energy: cost })) {
        AlertStore.add({
          kind: 'scan',
          title: 'Scan failed',
          preview: 'Need ' + cost + ' energy to scan.',
          reportTitle: 'Scan Report — Failed',
          reportBody:
            'Scan Report\n\nScan aborted.\nRequired: ' +
            cost +
            ' energy\nYou have: ' +
            vm.getResource('energy') +
            ' energy.',
        });
        vm.notifications = (vm.notifications || 0) + 1;
        return {
          ok: false,
          reason: 'Need ' + cost + ' energy to scan.',
        };
      }
      var label = info.siteLabel || 'Structure';
      var fish =
        info.fishCount != null
          ? Number(info.fishCount) || 0
          : vm.fishCountAtCell(info.col, info.row);
      var body =
        'Scan Report\n\n' +
        'Territory: ' +
        label +
        '\n' +
        'Location: ' +
        (info.col != null ? info.col + ', ' + info.row : 'unknown') +
        '\n' +
        'Mark: ' +
        (info.owner || 'unknown') +
        '\n' +
        'Scan cost: ' +
        cost +
        ' energy\n\n' +
        'Fish detected: ' +
        fish +
        '\n\n' +
        'Intel logged to your alerts.';
      var entry = AlertStore.add({
        kind: 'scan',
        title: 'Scan Report — ' + label,
        preview: fish + ' fish detected at ' + label,
        reportTitle: 'Scan Report — ' + label,
        reportBody: body,
        fishCount: fish,
        siteLabel: label,
      });
      vm.notifications = (vm.notifications || 0) + 1;
      return entry;
    };

    /**
     * Curve color kind:
     * blue  move  — your squads to own/ally, or ally reinforcing own/ally
     * red   attack — your strike on enemy/neutral, or hostile inbound on you/ally
     * orange warn — other players moving between non-you / non-ally structures
     *
     * @param {string} originOwner
     * @param {string} destOwner
     * @param {boolean} [owned=true] player-owned route when true / omitted
     */
    vm.travelLineKind = function (originOwner, destOwner, owned) {
      function friendly(m) {
        return m === 'own' || m === 'ally';
      }
      var o = originOwner || null;
      var d = destOwner || null;
      var isMine = owned !== false;
      if (isMine) {
        if (friendly(d)) {
          return 'move';
        }
        // Neutral or enemy destination = your attack
        return 'attack';
      }
      // Ally (or own) reinforcing friendly ground → blue
      if (friendly(o) && friendly(d)) {
        return 'move';
      }
      // Hostile traffic onto you/ally → red
      if (friendly(d) && !friendly(o)) {
        return 'attack';
      }
      // Leaving friendly ground as foreign hostile → red
      if (friendly(o) && !friendly(d)) {
        return 'attack';
      }
      // Third-party elsewhere → orange warning
      return 'warn';
    };

    vm.beginTravel = function (squadIds, origin) {
      if (!origin || !squadIds || !squadIds.length) {
        return;
      }
      vm.moveOpen = false;
      vm.moveTarget = null;
      vm.travelConfirmOpen = false;
      vm.travelConfirm = null;
      // New preview only — leave existing committed routes alone
      vm.travel.kind = null;
      vm.travel.active = true;
      vm.travel.origin = {
        col: origin.col,
        row: origin.row,
        left: origin.left,
        top: origin.top,
        siteLabel: origin.siteLabel || '',
        owner: origin.owner || 'own',
        buildingId: origin.buildingId || null,
      };
      vm.travel.squadIds = squadIds.slice();
      vm.travel.pinned = null;
      vm.travel.ticks = 0;
    };

    vm.pinTravelDestination = function (dest) {
      if (!vm.travel.active || !dest || !vm.travel.origin) {
        return;
      }
      var isTeleport = vm.travel.kind === 'teleport';
      // Same cell as origin → cancel preview + panels (routes stay)
      if (
        String(dest.col) === String(vm.travel.origin.col) &&
        String(dest.row) === String(vm.travel.origin.row)
      ) {
        vm.cancelTravelPreview();
        vm.closeMove();
        vm.closeTeleport();
        return;
      }
      // Empty cell → cancel preview
      if (!dest.hasBuilding) {
        vm.cancelTravelPreview();
        vm.closeMove();
        vm.closeTeleport();
        return;
      }
      // Teleport aim: only owned / ally sand tunnels
      if (isTeleport) {
        var bid = dest.buildingId || '';
        var own = dest.owner || null;
        if (
          bid !== 'sand-tunnel' ||
          (own !== 'own' && own !== 'ally')
        ) {
          // Invalid target — keep aiming
          return;
        }
      }
      vm.travel.pinned = {
        col: dest.col,
        row: dest.row,
        left: dest.left,
        top: dest.top,
        owner: dest.owner || null,
        siteLabel: dest.siteLabel || '',
        buildingId: dest.buildingId || null,
        hasBuilding: true,
      };
      var destOwner = dest.owner || null;
      var kind;
      var label;
      var ticks;
      var distanceTicks = 0;
      var squadN = (vm.travel.squadIds || []).length;
      var cost = 0;
      if (isTeleport) {
        kind = 'teleport';
        ticks = vm.TELEPORT_TICKS || 1;
        distanceTicks =
          dest.distanceTicks ||
          vm.travelTicksBetween(
            vm.travel.origin.col,
            vm.travel.origin.row,
            dest.col,
            dest.row
          );
        cost = vm.teleportCost(squadN, distanceTicks);
        label = dest.siteLabel || 'Sand Tunnel';
        vm.travel.ticks = ticks;
        vm.travel.distanceTicks = distanceTicks;
      } else {
        // Blue: own/ally ↔ own/ally. Orange: any neutral/enemy end.
        var originOwner =
          (vm.travel.origin && vm.travel.origin.owner) || 'own';
        kind = vm.travelLineKind(originOwner, destOwner);
        ticks = vm.travel.ticks || 0;
        label =
          dest.siteLabel ||
          (kind === 'attack' ? 'hostile structure' : 'structure');
      }
      vm.travel.kind = kind;
      vm.travelConfirm = {
        kind: kind,
        dest: vm.travel.pinned,
        ticks: ticks,
        distanceTicks: distanceTicks,
        squadCount: squadN,
        label: label,
        cost: cost,
      };
      vm.travelConfirmOpen = true;
    };

    vm.dismissTravelConfirm = function () {
      var keepTeleport = vm.travel && vm.travel.kind === 'teleport';
      vm.travelConfirmOpen = false;
      vm.travelConfirm = null;
      // Unpin so another cell can be chosen
      if (vm.travel) {
        vm.travel.pinned = null;
        if (keepTeleport) {
          vm.travel.ticks = vm.TELEPORT_TICKS || 1;
          vm.travel.distanceTicks = 0;
          vm.travel.kind = 'teleport';
        } else {
          vm.travel.ticks = 0;
          vm.travel.distanceTicks = 0;
          vm.travel.kind = null;
        }
      }
      clearMapSelectionSafe();
    };

    vm.confirmTravel = function () {
      var conf = vm.travelConfirm;
      if (!conf || !vm.travel.active || !vm.travel.pinned || !vm.travel.origin) {
        return;
      }
      var ids = vm.travel.squadIds || [];
      var ticks = Math.max(1, conf.ticks || vm.travel.ticks || 1);
      var destLabel = conf.label || 'destination';
      var destOwner = vm.travel.pinned.owner || null;
      var distanceTicks;
      var teleportCost;
      // Teleport: spend chemicals = squads × 10 × original ticks; arrive in 1 tick
      if (conf.kind === 'teleport') {
        ticks = vm.TELEPORT_TICKS || 1;
        distanceTicks =
          conf.distanceTicks ||
          vm.travel.distanceTicks ||
          vm.travelTicksBetween(
            vm.travel.origin.col,
            vm.travel.origin.row,
            vm.travel.pinned.col,
            vm.travel.pinned.row
          );
        teleportCost = vm.teleportCost(ids.length, distanceTicks);
        conf.cost = teleportCost;
        conf.distanceTicks = distanceTicks;
        if (
          !vm.spendResources ||
          !vm.spendResources({ flask: teleportCost })
        ) {
          conf.failReason =
            'Need ' + teleportCost + ' chemicals to teleport.';
          return;
        }
      }
      // Your move onto enemy/neutral → red attack (mark enemy)
      if (
        conf.kind !== 'teleport' &&
        (destOwner === 'neutral' || destOwner === 'enemy') &&
        typeof vm.markStructureOwner === 'function'
      ) {
        vm.markStructureOwner(
          vm.travel.pinned.col,
          vm.travel.pinned.row,
          'enemy'
        );
        vm.travel.pinned.owner = 'enemy';
        conf.kind = 'attack';
        vm.travel.kind = 'attack';
      }
      var ox = vm.travel.origin.left;
      var oy = vm.travel.origin.top;
      var dx = vm.travel.pinned.left - ox;
      var dy = vm.travel.pinned.top - oy;
      var facingDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      var i;
      var s;
      for (i = 0; i < ids.length; i += 1) {
        for (var j = 0; j < vm.squads.length; j += 1) {
          s = vm.squads[j];
          if (s && s.id === ids[i]) {
            s.state = 'travelling';
            s.destination = destLabel;
            s.ticks = ticks;
            s.ticksTotal = ticks;
            s.routeId = null; // set below
            s.col = vm.travel.origin.col;
            s.row = vm.travel.origin.row;
            s.destCol = vm.travel.pinned.col;
            s.destRow = vm.travel.pinned.row;
            s.location = destLabel;
            break;
          }
        }
      }
      vm.nextRouteId += 1;
      var routeId = 'r' + vm.nextRouteId;
      for (i = 0; i < ids.length; i += 1) {
        for (var jj = 0; jj < vm.squads.length; jj += 1) {
          if (vm.squads[jj] && vm.squads[jj].id === ids[i]) {
            vm.squads[jj].routeId = routeId;
          }
        }
      }
      // Push a new committed route — previous routes stay on the map
      vm.travel.routes.push({
        id: routeId,
        kind: conf.kind || vm.travel.kind || 'move',
        owned: true, // player-confirmed squads are selectable for Return
        origin: {
          col: vm.travel.origin.col,
          row: vm.travel.origin.row,
          left: vm.travel.origin.left,
          top: vm.travel.origin.top,
          siteLabel: vm.travel.origin.siteLabel || '',
          owner: vm.travel.origin.owner || 'own',
          buildingId: vm.travel.origin.buildingId || null,
          hasBuilding: true,
        },
        pinned: {
          col: vm.travel.pinned.col,
          row: vm.travel.pinned.row,
          left: vm.travel.pinned.left,
          top: vm.travel.pinned.top,
          owner: vm.travel.pinned.owner,
          siteLabel: vm.travel.pinned.siteLabel || '',
          buildingId: vm.travel.pinned.buildingId || null,
          hasBuilding: true,
        },
        squadIds: ids.slice(),
        squadCount: ids.length,
        ticksTotal: ticks,
        ticksLeft: ticks,
        progress: 0,
        facingDeg: facingDeg,
      });
      // Clear preview so another Move can start without wiping routes
      vm.travel.active = false;
      vm.travel.origin = null;
      vm.travel.pinned = null;
      vm.travel.squadIds = [];
      vm.travel.kind = null;
      vm.travel.ticks = 0;
      vm.travel.selectedRouteId = null;
      vm.travelConfirmOpen = false;
      vm.travelConfirm = null;
      clearMapSelectionSafe();
      clearTravelSelectionSafe();
    };

    /** Reverse an owned in-flight route: swap ends, flip face, recalc ticks. */
    vm.returnTravel = function (routeId) {
      if (!vm.travel || !vm.travel.routes || !routeId) {
        return;
      }
      var route = null;
      var i;
      for (i = 0; i < vm.travel.routes.length; i += 1) {
        if (vm.travel.routes[i] && vm.travel.routes[i].id === routeId) {
          route = vm.travel.routes[i];
          break;
        }
      }
      if (!route || !route.owned || !route.origin || !route.pinned) {
        return;
      }
      var oldProgress = route.progress != null ? route.progress : 0;
      if (oldProgress < 0) {
        oldProgress = 0;
      }
      if (oldProgress > 1) {
        oldProgress = 1;
      }
      var oldOrigin = route.origin;
      var oldPinned = route.pinned;
      // Swap origin ↔ destination
      route.origin = {
        col: oldPinned.col,
        row: oldPinned.row,
        left: oldPinned.left,
        top: oldPinned.top,
        siteLabel: oldPinned.siteLabel || '',
        owner: oldPinned.owner || null,
        hasBuilding: true,
      };
      route.pinned = {
        col: oldOrigin.col,
        row: oldOrigin.row,
        left: oldOrigin.left,
        top: oldOrigin.top,
        siteLabel: oldOrigin.siteLabel || '',
        owner: oldOrigin.owner || 'own',
        hasBuilding: true,
      };
      // Stay on the path: progress mirrors so the stingray keeps its map spot
      var newProgress = 1 - oldProgress;
      // Path length A↔B is unchanged; remaining = fraction still to new dest
      var ticksTotal = Math.max(1, route.ticksTotal || 1);
      var ticksLeft = Math.max(1, Math.round((1 - newProgress) * ticksTotal));
      route.ticksTotal = ticksTotal;
      route.ticksLeft = ticksLeft;
      route.progress = (ticksTotal - ticksLeft) / ticksTotal;
      var dx = route.pinned.left - route.origin.left;
      var dy = route.pinned.top - route.origin.top;
      route.facingDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      // Keep teleport; otherwise blue / red / orange by ownership + ends
      if (route.kind !== 'teleport') {
        route.kind = vm.travelLineKind(
          route.origin.owner,
          route.pinned.owner,
          route.owned !== false
        );
      }
      var destLabel =
        route.pinned.siteLabel ||
        (route.kind === 'attack' ? 'hostile structure' : 'structure');
      var ids = route.squadIds || [];
      var j;
      var s;
      for (i = 0; i < ids.length; i += 1) {
        for (j = 0; j < vm.squads.length; j += 1) {
          s = vm.squads[j];
          if (s && s.id === ids[i] && s.state === 'travelling') {
            s.destination = destLabel;
            s.ticks = ticksLeft;
            s.ticksTotal = ticksTotal;
            s.destCol = route.pinned.col;
            s.destRow = route.pinned.row;
            s.location = destLabel;
            break;
          }
        }
      }
      vm.travel.selectedRouteId = null;
      clearTravelSelectionSafe();
    };

    function fishHp(fishId) {
      return vm.FISH_HP[fishId] || 15;
    }

    function typeMatchup(atkEl, defEl) {
      if (!atkEl || !defEl || atkEl === defEl) {
        return 1;
      }
      if (vm.TYPE_BEATS[atkEl] === defEl) {
        return 1.5; // strong vs
      }
      if (vm.TYPE_BEATS[defEl] === atkEl) {
        return 2 / 3; // weak vs
      }
      return 1;
    }

    /** Normalize a squad's unit mix (synthesize from total when missing). */
    vm.squadUnitMap = function (squad) {
      var out = {};
      var key;
      var n;
      var left;
      var fishes;
      var els;
      var fi;
      var ei;
      var take;
      if (!squad) {
        return out;
      }
      if (squad.units) {
        for (key in squad.units) {
          if (Object.prototype.hasOwnProperty.call(squad.units, key)) {
            n = Number(squad.units[key]) || 0;
            if (n > 0) {
              out[key] = n;
            }
          }
        }
        return out;
      }
      left = Number(squad.total) || 0;
      fishes = ['flying', 'sword', 'puffer'];
      els = ['armoured', 'shock', 'toxic'];
      fi = 0;
      ei = 0;
      while (left > 0) {
        key = fishes[fi % 3] + '-' + els[ei % 3];
        take = 1;
        out[key] = (out[key] || 0) + take;
        left -= 1;
        fi += 1;
        ei += 1;
      }
      return out;
    };

    function countUnits(map) {
      var key;
      var sum = 0;
      for (key in map) {
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          sum += Number(map[key]) || 0;
        }
      }
      return sum;
    }

    function expandCombatants(unitMap) {
      var list = [];
      var key;
      var parts;
      var fish;
      var el;
      var n;
      var i;
      for (key in unitMap) {
        if (!Object.prototype.hasOwnProperty.call(unitMap, key)) {
          continue;
        }
        n = Number(unitMap[key]) || 0;
        parts = String(key).split('-');
        fish = parts[0];
        el = parts[1] || 'armoured';
        for (i = 0; i < n; i += 1) {
          list.push({
            fish: fish,
            element: el,
            maxHp: fishHp(fish),
            hp: fishHp(fish),
          });
        }
      }
      return list;
    }

    function collapseCombatants(list) {
      var map = {};
      var i;
      var c;
      var key;
      for (i = 0; i < list.length; i += 1) {
        c = list[i];
        if (!c || c.hp <= 0) {
          continue;
        }
        key = c.fish + '-' + c.element;
        map[key] = (map[key] || 0) + 1;
      }
      return map;
    }

    /** Garrison fish → mixed defender composition. */
    function synthesizeGarrisonUnits(garrison) {
      var map = {};
      var left = Math.max(0, Number(garrison) || 0);
      var fishes = ['flying', 'sword', 'puffer'];
      var els = ['armoured', 'shock', 'toxic'];
      var i = 0;
      var key;
      while (left > 0) {
        key = fishes[i % 3] + '-' + els[i % 3];
        map[key] = (map[key] || 0) + 1;
        left -= 1;
        i += 1;
      }
      return map;
    }

    /**
     * Fight until one side is wiped.
     * Damage per clash ≈ fish life × type matchup (armoured↔shock↔toxic).
     */
    vm.resolveCombat = function (atkMap, defMap) {
      var atk = expandCombatants(atkMap || {});
      var def = expandCombatants(defMap || {});
      var aDmg;
      var dDmg;
      var a;
      var d;
      while (atk.length && def.length) {
        a = atk[0];
        d = def[0];
        aDmg = Math.max(
          1,
          Math.round(a.maxHp * typeMatchup(a.element, d.element))
        );
        dDmg = Math.max(
          1,
          Math.round(d.maxHp * typeMatchup(d.element, a.element))
        );
        d.hp -= aDmg;
        a.hp -= dDmg;
        if (d.hp <= 0) {
          def.shift();
        }
        if (a.hp <= 0) {
          atk.shift();
        }
      }
      return {
        winner: atk.length ? 'attacker' : def.length ? 'defender' : 'draw',
        attackerUnits: collapseCombatants(atk),
        defenderUnits: collapseCombatants(def),
        attackerLeft: atk.length,
        defenderLeft: def.length,
      };
    };

    function applyUnitsToSquad(squad, unitMap) {
      var total = countUnits(unitMap);
      squad.units = unitMap;
      squad.total = total;
      return total;
    }

    /**
     * Attack arrival: fight garrison, conquer on win.
     * Coral reef win → becomes owned Shell Radar. Survivors stay on cell.
     */
    vm.resolveAttackArrival = function (route, arriving) {
      var info =
        typeof vm.getStructureAt === 'function'
          ? vm.getStructureAt(route.pinned.col, route.pinned.row)
          : null;
      var label =
        (info && info.siteLabel) ||
        (route.pinned && route.pinned.siteLabel) ||
        'Structure';
      var buildingId =
        (info && info.buildingId) ||
        (route.pinned && route.pinned.buildingId) ||
        '';
      var defenderName =
        (info && info.playerName) ||
        (route.pinned && route.pinned.owner) ||
        'Enemy';
      var garrison =
        info && info.garrison != null
          ? Number(info.garrison) || 0
          : buildingId === 'coral-reef'
            ? 18
            : 9;
      var atkMap = {};
      var i;
      var s;
      var part;
      var key;
      var result;
      var survivors;
      var won;
      var newLabel;
      var body;

      for (i = 0; i < arriving.length; i += 1) {
        part = vm.squadUnitMap(arriving[i]);
        for (key in part) {
          if (Object.prototype.hasOwnProperty.call(part, key)) {
            atkMap[key] = (atkMap[key] || 0) + part[key];
          }
        }
      }

      result = vm.resolveCombat(atkMap, synthesizeGarrisonUnits(garrison));
      won = result.winner === 'attacker';
      survivors = result.attackerUnits;

      // Split survivors back across arriving squads (first squads keep fish)
      for (i = 0; i < arriving.length; i += 1) {
        s = arriving[i];
        if (i === 0) {
          applyUnitsToSquad(s, survivors);
        } else {
          applyUnitsToSquad(s, {});
        }
        s.state = 'idle';
        s.ticks = 0;
        s.routeId = null;
        s.col = route.pinned.col;
        s.row = route.pinned.row;
        s.destCol = null;
        s.destRow = null;
      }

      // Drop wiped squads
      var arriveIds = {};
      for (i = 0; i < arriving.length; i += 1) {
        if (arriving[i] && arriving[i].id) {
          arriveIds[arriving[i].id] = true;
        }
      }
      vm.squads = (vm.squads || []).filter(function (sq) {
        if (!sq || !arriveIds[sq.id]) {
          return true;
        }
        return !!(sq.total && sq.total > 0);
      });

      if (won) {
        newLabel = label;
        if (typeof vm.conquerStructure === 'function') {
          newLabel =
            vm.conquerStructure(route.pinned.col, route.pinned.row) ||
            label;
        }
        // Survivors remain idle on the conquered cell
        for (i = 0; i < arriving.length; i += 1) {
          s = arriving[i];
          if (s && s.total > 0) {
            s.location = newLabel;
            s.destination = null;
          }
        }
        if (
          typeof vm.setStructureGarrison === 'function' &&
          result.attackerLeft > 0
        ) {
          vm.setStructureGarrison(
            route.pinned.col,
            route.pinned.row,
            result.attackerLeft
          );
        }
        if (info) {
          info.siteLabel = newLabel;
        }
        body =
          'Battle Report\n\n' +
          'Attacker: ' +
          ((vm.captain && vm.captain.name) || 'You') +
          '\n' +
          'Defender: ' +
          defenderName +
          '\n' +
          'Territory: ' +
          label +
          '\n\n' +
          'Outcome: Conquered.\n' +
          (buildingId === 'coral-reef'
            ? 'Coral Reef converted to owned Shell Radar.\n'
            : 'Structure now under your control.\n') +
          'Survivors: ' +
          result.attackerLeft +
          ' fish remain on site.\n' +
          'Matchup: Armoured < Shock < Toxic < Armoured\n' +
          'Life: Flying 15 · Sword 30 · Puffer 60';
        AlertStore.add({
          kind: 'battle',
          title: label + ' conquered',
          preview: 'You conquered ' + label + ' from ' + defenderName,
          reportTitle: 'Battle Report — ' + label,
          reportBody: body,
        });
        vm.notifications = (vm.notifications || 0) + 1;
      } else {
        body =
          'Battle Report\n\n' +
          'Attacker: ' +
          ((vm.captain && vm.captain.name) || 'You') +
          '\n' +
          'Defender: ' +
          defenderName +
          '\n' +
          'Territory: ' +
          label +
          '\n\n' +
          'Outcome: Attack failed.\n' +
          'Defenders remaining: ' +
          result.defenderLeft +
          '\n' +
          'Your survivors: ' +
          result.attackerLeft +
          ' (still at ' +
          label +
          ').';
        AlertStore.add({
          kind: 'battle',
          title: 'Attack on ' + label + ' failed',
          preview: 'Your assault on ' + label + ' was repelled',
          reportTitle: 'Battle Report — ' + label,
          reportBody: body,
        });
        vm.notifications = (vm.notifications || 0) + 1;
        // Update visible garrison if defenders remain
        if (
          typeof vm.setStructureGarrison === 'function' &&
          result.defenderLeft >= 0
        ) {
          vm.setStructureGarrison(
            route.pinned.col,
            route.pinned.row,
            result.defenderLeft
          );
        }
      }
      return result;
    };

    /**
     * Radar contacts from live travel routes:
     * - Attacks targeting own or ally structures
     * - Ally moves to ally or owned structures
     */
    vm.radarContacts = function () {
      var routes = (vm.travel && vm.travel.routes) || [];
      var out = [];
      var i;
      var r;
      var oOwner;
      var dOwner;
      var destLabel;
      var originLabel;
      var eta;
      var squads;
      function mineOrAlly(m) {
        return m === 'own' || m === 'ally';
      }
      for (i = 0; i < routes.length; i += 1) {
        r = routes[i];
        if (!r || !r.origin || !r.pinned || r.kind === 'teleport') {
          continue;
        }
        oOwner = r.origin.owner || null;
        dOwner = r.pinned.owner || null;
        destLabel = r.pinned.siteLabel || 'structure';
        originLabel = r.origin.siteLabel || 'structure';
        eta = r.ticksLeft != null ? r.ticksLeft : 0;
        squads = r.squadCount || (r.squadIds && r.squadIds.length) || 1;

        // Attacks on me or my ally (inbound hostile)
        if (
          r.kind === 'attack' &&
          mineOrAlly(dOwner) &&
          !mineOrAlly(oOwner)
        ) {
          out.push({
            id: r.id + '-atk',
            routeId: r.id,
            name: 'Attack → ' + destLabel,
            detail: 'From ' + originLabel,
            side: 'enemy',
            kind: 'attack',
            eta: eta,
            squads: squads,
            col: r.pinned.col,
            row: r.pinned.row,
          });
          continue;
        }

        // Ally moving to ally or owned structures
        if (
          oOwner === 'ally' &&
          (dOwner === 'ally' || dOwner === 'own') &&
          r.kind === 'move'
        ) {
          out.push({
            id: r.id + '-ally',
            routeId: r.id,
            name: 'Ally → ' + destLabel,
            detail: 'From ' + originLabel,
            side: 'ally',
            kind: 'move',
            eta: eta,
            squads: squads,
            col: r.pinned.col,
            row: r.pinned.row,
          });
        }
      }
      // Soonest arrivals first
      out.sort(function (a, b) {
        return (a.eta || 0) - (b.eta || 0);
      });
      return out;
    };

    /** Advance every committed route one tick. */
    vm.advanceTravel = function () {
      if (!vm.travel || !vm.travel.routes || !vm.travel.routes.length) {
        return;
      }
      var still = [];
      var r;
      var ri;
      var ids;
      var i;
      var j;
      var s;
      var total;
      var arriving;
      for (ri = 0; ri < vm.travel.routes.length; ri += 1) {
        r = vm.travel.routes[ri];
        total = r.ticksTotal || 1;
        if (r.ticksLeft > 0) {
          r.ticksLeft -= 1;
          r.progress = (total - r.ticksLeft) / total;
        }
        ids = r.squadIds || [];
        for (i = 0; i < ids.length; i += 1) {
          for (j = 0; j < vm.squads.length; j += 1) {
            s = vm.squads[j];
            if (s && s.id === ids[i] && s.state === 'travelling') {
              s.ticks = r.ticksLeft;
              break;
            }
          }
        }
        if (r.ticksLeft <= 0) {
          arriving = [];
          for (i = 0; i < ids.length; i += 1) {
            for (j = 0; j < vm.squads.length; j += 1) {
              s = vm.squads[j];
              if (s && s.id === ids[i]) {
                arriving.push(s);
                break;
              }
            }
          }
          if (r.owned === false) {
            // Foreign orange/red traffic: visual only — no local squad resolve
          } else if (r.kind === 'attack') {
            vm.resolveAttackArrival(r, arriving);
          } else {
            for (i = 0; i < arriving.length; i += 1) {
              s = arriving[i];
              s.state = 'idle';
              s.ticks = 0;
              s.routeId = null;
              s.col = r.pinned.col;
              s.row = r.pinned.row;
              s.location =
                r.pinned.siteLabel || s.destination || s.location;
              s.destination = null;
            }
          }
        } else {
          still.push(r);
        }
      }
      vm.travel.routes = still;
    };

    /** Cancel preview aiming only — committed routes keep flying. */
    vm.cancelTravelPreview = function () {
      vm.travel.active = false;
      vm.travel.kind = null;
      vm.travel.origin = null;
      vm.travel.squadIds = [];
      vm.travel.pinned = null;
      vm.travel.ticks = 0;
      vm.travelConfirmOpen = false;
      vm.travelConfirm = null;
      clearMapSelectionSafe();
    };

    /** @deprecated alias — preview cancel; does not clear committed routes */
    vm.cancelTravel = function () {
      vm.cancelTravelPreview();
    };

    function closeAllPanels() {
      vm.mailOpen = false;
      vm.composeOpen = false;
      vm.composeTarget = null;
      vm.statsOpen = false;
      vm.statsTarget = null;
      vm.alertsOpen = false;
      vm.settingsOpen = false;
      vm.rewardsOpen = false;
      vm.spinOpen = false;
      vm.rankingOpen = false;
      vm.searchOpen = false;
      vm.squadOpen = false;
      vm.radarOpen = false;
      vm.allianceOpen = false;
      vm.chatOpen = false;
      vm.buildOpen = false;
      vm.buildTarget = null;
      vm.moveOpen = false;
      vm.moveTarget = null;
      vm.teleportOpen = false;
      vm.teleportTarget = null;
      vm.tutorialOpen = false;
      // Travel confirm stays tied to map travel — only clear via dismiss/confirm
    }

    /** Total fish across every owned squad (idle / building / travelling). */
    vm.totalSquadFish = function () {
      var sum = 0;
      var i;
      var s;
      var key;
      var units;
      for (i = 0; i < (vm.squads || []).length; i += 1) {
        s = vm.squads[i];
        if (!s) {
          continue;
        }
        if (s.total != null && s.total > 0) {
          sum += Number(s.total) || 0;
          continue;
        }
        units = s.units || {};
        for (key in units) {
          if (Object.prototype.hasOwnProperty.call(units, key)) {
            sum += Number(units[key]) || 0;
          }
        }
      }
      return sum;
    };

    /** Score: +10 per owned structure, +1 per fish in all squads. */
    vm.playerScoreBreakdown = function () {
      var structures =
        typeof vm.countOwnStructures === 'function'
          ? vm.countOwnStructures()
          : 0;
      var fish = vm.totalSquadFish();
      var structurePts = structures * 10;
      var fishPts = fish * 1;
      return {
        structures: structures,
        fish: fish,
        structurePts: structurePts,
        fishPts: fishPts,
        total: structurePts + fishPts,
      };
    };

    vm.playerScore = function () {
      return vm.playerScoreBreakdown().total;
    };

    /**
     * Unified stats view for self or another captain (profile icon).
     * Other players: structures linked to their reef + garrison fish.
     */
    vm.statsView = function () {
      var target = vm.statsTarget;
      var selfName = (vm.captain && vm.captain.name) || 'CaptainShelly';
      var bd;
      var structures;
      var fish;
      var structurePts;
      var fishPts;
      if (!target || target.self) {
        bd = vm.playerScoreBreakdown();
        return {
          name: selfName,
          vip: !!vm.vip,
          self: true,
          owner: 'own',
          structures: bd.structures,
          fish: bd.fish,
          structurePts: bd.structurePts,
          fishPts: bd.fishPts,
          total: bd.total,
        };
      }
      structures =
        typeof vm.countStructuresForReef === 'function'
          ? vm.countStructuresForReef(target.col, target.row)
          : target.structures || 0;
      fish =
        typeof vm.sumGarrisonForReef === 'function'
          ? vm.sumGarrisonForReef(target.col, target.row)
          : target.fish || 0;
      structurePts = structures * 10;
      fishPts = fish * 1;
      return {
        name: target.name || 'Captain',
        vip: !!target.vip,
        self: false,
        owner: target.owner || null,
        structures: structures,
        fish: fish,
        structurePts: structurePts,
        fishPts: fishPts,
        total: structurePts + fishPts,
      };
    };

    vm.openStats = function () {
      closeAllPanels();
      vm.statsTarget = { self: true };
      vm.statsOpen = true;
    };

    /** Profile on another player's reef / linked structure. */
    vm.openPlayerStats = function (info) {
      closeAllPanels();
      vm.statsTarget = info
        ? {
            self: false,
            name: info.name || 'Captain',
            vip: !!info.vip,
            owner: info.owner || null,
            col: info.col,
            row: info.row,
          }
        : { self: true };
      vm.statsOpen = true;
    };

    vm.closeStats = function () {
      vm.statsOpen = false;
      vm.statsTarget = null;
    };

    vm.openMail = function () {
      closeAllPanels();
      vm.mailOpen = true;
    };

    vm.closeMail = function () {
      vm.mailOpen = false;
    };

    /** Message action on a coral reef → compose to that player. */
    vm.openComposeMessage = function (target) {
      closeAllPanels();
      vm.composeTarget = target || null;
      vm.composeOpen = true;
    };

    vm.closeComposeMessage = function () {
      vm.composeOpen = false;
      vm.composeTarget = null;
    };

    vm.openAlerts = function () {
      closeAllPanels();
      vm.alertsOpen = true;
    };

    vm.closeAlerts = function () {
      vm.alertsOpen = false;
    };

    vm.openSettings = function () {
      closeAllPanels();
      vm.settingsOpen = true;
    };

    vm.closeSettings = function () {
      vm.settingsOpen = false;
    };

    vm.openRewards = function () {
      closeAllPanels();
      vm.rewardsOpen = true;
    };

    vm.closeRewards = function () {
      vm.rewardsOpen = false;
    };

    vm.openSpin = function () {
      closeAllPanels();
      vm.spinOpen = true;
    };

    vm.closeSpin = function () {
      vm.spinOpen = false;
    };

    vm.openRanking = function () {
      closeAllPanels();
      vm.rankingOpen = true;
    };

    vm.closeRanking = function () {
      vm.rankingOpen = false;
    };

    vm.openSearch = function () {
      closeAllPanels();
      vm.searchOpen = true;
    };

    vm.closeSearch = function () {
      vm.searchOpen = false;
    };

    vm.hasUnreadMail = function () {
      return MailStore.hasUnread();
    };

    vm.hasUnreadAlerts = function () {
      return AlertStore.hasUnread();
    };

    var tickTimer = $interval(function () {
      vm.tickSeconds -= 1;
      if (vm.tickSeconds < 0) {
        vm.tickNumber += 1;
        vm.tickSeconds = 5 * 60;
        // Each tick: +10 scrap/flask/energy, +1 fish (population)
        vm.grantTickIncome();
        // Squad builds + travel routes
        vm.advanceBuilding();
        vm.advanceTravel();
      }
      vm.tickLabel = formatTick(vm.tickSeconds, vm.tickNumber);
    }, 1000);

    $scope.$on('$destroy', function () {
      $interval.cancel(tickTimer);
    });
  }

  function formatAmount(n) {
    var num = Math.max(0, Math.floor(Number(n) || 0));
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatTick(total, tickNumber) {
    var m = Math.floor(total / 60);
    var s = total % 60;
    var mm = m < 10 ? '0' + m : String(m);
    var ss = s < 10 ? '0' + s : String(s);
    return mm + ':' + ss + ' until Tick ' + tickNumber;
  }

  /** Search: player username field + Go → pan map to their reef. */
  function SearchCtrl($scope) {
    var vm = this;
    var game = $scope.game;
    vm.query = '';
    vm.status = '';

    // Sample directory (no backend) — keys are lowercase usernames
    var PLAYER_SITES = {
      reefrunner: { col: 46, row: 4, label: 'Ally Radar' },
      shadowtide: { col: 48, row: 7, label: 'Enemy Reef' },
      crimsonreef: { col: 48, row: 7, label: 'Enemy Reef' },
      pearlfox: { col: 46, row: 4, label: 'Ally Radar' },
    };

    vm.go = function () {
      var name = String(vm.query || '').replace(/\s+/g, '');
      if (!name) {
        vm.status = 'Enter a player name.';
        return;
      }
      vm.query = name;
      var key = name.toLowerCase();
      var selfName = (
        (game && game.captain && game.captain.name) ||
        ''
      ).toLowerCase();
      if (key === selfName) {
        if (game && game.focusHomeReef && game.focusHomeReef()) {
          vm.status = 'Viewing your Coral Reef.';
          game.closeSearch();
        } else {
          vm.status = 'That’s you — ' + name + '.';
        }
        return;
      }
      var site = PLAYER_SITES[key];
      if (site && game && typeof game.focusMapCell === 'function') {
        game.focusMapCell(site.col, site.row);
        vm.status = 'Viewing ' + name + ' (' + site.label + ').';
        game.closeSearch();
        return;
      }
      vm.status = 'No location found for ' + name + '.';
    };
  }

  /** Squad: create + list with status / Go / Delete. */
  function SquadCtrl($scope) {
    var vm = this;

    function getGame() {
      return $scope.game;
    }

    vm.view = 'list'; // list | create
    vm.newName = '';
    vm.status = '';
    vm.MAX_UNITS = (getGame() && getGame().SQUAD_MAX_UNITS) || 15;
    vm.POP_PER_UNIT = 2; // fish population per unit
    vm.ELEMENT_COST = 50; // scrap / chemical / energy per typed unit

    vm.fishSize = function (squad) {
      var game = getGame();
      if (game && typeof game.squadSizeLabel === 'function') {
        return game.squadSizeLabel(squad);
      }
      var n = squad && squad.total != null ? squad.total : 0;
      return n + '/' + vm.MAX_UNITS;
    };
    vm.fishes = [
      {
        id: 'flying',
        name: 'Flying Fish',
        role: 'Scout',
        icon: '/img/fish-flying.png',
      },
      {
        id: 'sword',
        name: 'Swordfish',
        role: 'Hitter',
        icon: '/img/fish-sword.png',
      },
      {
        id: 'puffer',
        name: 'Pufferfish',
        role: 'Tank',
        icon: '/img/fish-puffer.png',
      },
    ];
    vm.elements = [
      { id: 'armoured', name: 'Armoured' },
      { id: 'shock', name: 'Shock' },
      { id: 'toxic', name: 'Toxic' },
    ];
    vm.unitCounts = {};

    Object.defineProperty(vm, 'squads', {
      get: function () {
        var game = getGame();
        return (game && game.squads) || [];
      },
    });

    function unitKey(fishId, elementId) {
      return fishId + '-' + elementId;
    }

    function blankCounts() {
      var counts = {};
      var i;
      var j;
      for (i = 0; i < vm.fishes.length; i += 1) {
        for (j = 0; j < vm.elements.length; j += 1) {
          counts[unitKey(vm.fishes[i].id, vm.elements[j].id)] = 0;
        }
      }
      return counts;
    }

    vm.unitCounts = blankCounts();

    vm.stateLabel = function (squad) {
      if (!squad) {
        return '';
      }
      if (squad.state === 'idle') {
        return 'idle on ' + (squad.location || 'Shell Radar 1');
      }
      if (squad.state === 'travelling') {
        return 'travelling to ' + (squad.destination || 'Shell Radar 1');
      }
      if (squad.state === 'building') {
        return 'Building · ' + (squad.ticks || 0) + ' ticks';
      }
      return String(squad.state || '');
    };

    vm.getCount = function (fishId, elementId) {
      return vm.unitCounts[unitKey(fishId, elementId)] || 0;
    };

    vm.totalUnits = function () {
      var key;
      var sum = 0;
      for (key in vm.unitCounts) {
        if (Object.prototype.hasOwnProperty.call(vm.unitCounts, key)) {
          sum += vm.unitCounts[key] || 0;
        }
      }
      return sum;
    };

    /** Cost + build time from a unit-count map (defaults to current mix). */
    vm.buildCost = function (counts) {
      var map = counts || vm.unitCounts;
      var scrap = 0;
      var flask = 0;
      var energy = 0;
      var units = 0;
      var key;
      var n;
      var el;
      for (key in map) {
        if (!Object.prototype.hasOwnProperty.call(map, key)) {
          continue;
        }
        n = Number(map[key]) || 0;
        if (n <= 0) {
          continue;
        }
        units += n;
        el = String(key).split('-').pop();
        if (el === 'armoured') {
          scrap += n * vm.ELEMENT_COST;
        } else if (el === 'shock') {
          energy += n * vm.ELEMENT_COST;
        } else if (el === 'toxic') {
          flask += n * vm.ELEMENT_COST;
        }
      }
      return {
        units: units,
        ticks: units, // 1 fish unit → 1 tick
        fish: units * vm.POP_PER_UNIT,
        scrap: scrap,
        flask: flask,
        energy: energy,
      };
    };

    vm.resourceLabel = function (id) {
      if (id === 'fish') {
        return 'population';
      }
      if (id === 'flask') {
        return 'chemicals';
      }
      if (id === 'scrap') {
        return 'scraps';
      }
      if (id === 'energy') {
        return 'energy';
      }
      return id;
    };

    function haveResource(id) {
      var game = getGame();
      if (!game || typeof game.getResource !== 'function') {
        return 0;
      }
      return Number(game.getResource(id)) || 0;
    }

    /** Shortfalls for a cost object. */
    vm.costShortfalls = function (cost) {
      var c = cost || vm.buildCost();
      var short = [];
      if (haveResource('fish') < (c.fish || 0)) {
        short.push('population');
      }
      if (haveResource('scrap') < (c.scrap || 0)) {
        short.push('scraps');
      }
      if (haveResource('flask') < (c.flask || 0)) {
        short.push('chemicals');
      }
      if (haveResource('energy') < (c.energy || 0)) {
        short.push('energy');
      }
      return short;
    };

    vm.canAffordCost = function (cost) {
      return vm.costShortfalls(cost).length === 0;
    };

    vm.isCostShort = function (id) {
      var cost = vm.buildCost();
      return haveResource(id) < (cost[id] || 0);
    };

    /** Whether adding one more of this unit stays within player resources. */
    vm.canAffordUnit = function (fishId, elementId) {
      var key = unitKey(fishId, elementId);
      var next = {};
      var k;
      for (k in vm.unitCounts) {
        if (Object.prototype.hasOwnProperty.call(vm.unitCounts, k)) {
          next[k] = vm.unitCounts[k] || 0;
        }
      }
      next[key] = (next[key] || 0) + 1;
      return vm.canAffordCost(vm.buildCost(next));
    };

    vm.canCreate = function () {
      var name = String(vm.newName || '').trim();
      var cost = vm.buildCost();
      return (
        !!name &&
        cost.units >= 1 &&
        cost.units <= vm.MAX_UNITS &&
        vm.canAffordCost(cost)
      );
    };

    vm.addUnit = function (fishId, elementId) {
      var key = unitKey(fishId, elementId);
      if (vm.totalUnits() >= vm.MAX_UNITS) {
        vm.status = 'Squad max is ' + vm.MAX_UNITS + ' units.';
        return;
      }
      if (!vm.canAffordUnit(fishId, elementId)) {
        var next = {};
        var k;
        for (k in vm.unitCounts) {
          if (Object.prototype.hasOwnProperty.call(vm.unitCounts, k)) {
            next[k] = vm.unitCounts[k] || 0;
          }
        }
        next[key] = (next[key] || 0) + 1;
        var short = vm.costShortfalls(vm.buildCost(next));
        vm.status =
          'Not enough ' + (short.length ? short.join(', ') : 'resources') + '.';
        return;
      }
      vm.unitCounts[key] = (vm.unitCounts[key] || 0) + 1;
      vm.status = '';
    };

    vm.removeUnit = function (fishId, elementId, $event) {
      if ($event) {
        $event.stopPropagation();
        $event.preventDefault();
      }
      var key = unitKey(fishId, elementId);
      if ((vm.unitCounts[key] || 0) <= 0) {
        return;
      }
      vm.unitCounts[key] -= 1;
      vm.status = '';
    };

    vm.openCreate = function () {
      vm.view = 'create';
      vm.newName = '';
      vm.status = '';
      vm.unitCounts = blankCounts();
    };

    vm.backToList = function () {
      vm.view = 'list';
      vm.status = '';
    };

    vm.createSquad = function () {
      var game = getGame();
      var name = String(vm.newName || '').trim();
      var cost = vm.buildCost();
      var total = cost.units;
      var short;
      if (!name) {
        vm.status = 'Enter a squad name.';
        return;
      }
      if (total < 1) {
        vm.status = 'Add at least 1 unit.';
        return;
      }
      if (total > vm.MAX_UNITS) {
        vm.status = 'Squad max is ' + vm.MAX_UNITS + ' units.';
        return;
      }
      if (!game || typeof game.spendResources !== 'function') {
        vm.status = 'Cannot spend resources right now.';
        return;
      }
      // Hard gate before spend — never create if short
      short = vm.costShortfalls(cost);
      if (short.length) {
        vm.status =
          'Need more ' + short.join(', ') + ' before creating this squad.';
        return;
      }
      if (
        !game.spendResources({
          fish: cost.fish || 0,
          scrap: cost.scrap || 0,
          flask: cost.flask || 0,
          energy: cost.energy || 0,
        })
      ) {
        short = vm.costShortfalls(cost);
        vm.status =
          'Need ' + (short.length ? short.join(', ') : 'more resources') + '.';
        return;
      }
      var reef = game.ownCoralReef;
      var col = reef && reef.col != null ? reef.col : 49;
      var row = reef && reef.row != null ? reef.row : 5;
      game.nextSquadId = (game.nextSquadId || 1) + 1;
      game.squads.push({
        id: 's' + game.nextSquadId,
        name: name,
        state: 'building',
        ticks: cost.ticks,
        ticksTotal: cost.ticks,
        total: total,
        units: angular.copy(vm.unitCounts),
        col: col,
        row: row,
        location: 'Coral Reef 1',
      });
      vm.newName = '';
      vm.status = '';
      vm.unitCounts = blankCounts();
      vm.view = 'list';
    };

    vm.canGo = function (squad) {
      var game = getGame();
      if (!squad || !game) {
        return false;
      }
      // Building with no map cell can't be viewed yet
      if (squad.state === 'building') {
        return squad.col != null && squad.row != null;
      }
      return !!game.squadViewTarget(squad);
    };

    vm.goSquad = function (squad) {
      var game = getGame();
      if (!squad || !game) {
        return;
      }
      if (!vm.canGo(squad)) {
        vm.status = squad.name + ' has no map location yet.';
        return;
      }
      if (game.focusSquad(squad)) {
        vm.status = 'Viewing ' + squad.name + '.';
        game.closeSquad();
      } else {
        vm.status = 'Could not open map for ' + squad.name + '.';
      }
    };
  }

  /** Move panel: pick idle squads on a structure cell, then Travel. */
  function MoveCtrl($scope) {
    var vm = this;
    var game = $scope.game;

    vm.status = '';
    vm.selected = {};

    vm.siteLabel = function () {
      return (game && game.moveTarget && game.moveTarget.siteLabel) || 'Structure';
    };

    vm.fishSize = function (squad) {
      if (game && typeof game.squadSizeLabel === 'function') {
        return game.squadSizeLabel(squad);
      }
      var max = (game && game.SQUAD_MAX_UNITS) || 15;
      var n = squad && squad.total != null ? squad.total : 0;
      return n + '/' + max;
    };

    vm.squads = function () {
      if (!game || !game.moveTarget) {
        return [];
      }
      return game.squadsAtCell(game.moveTarget.col, game.moveTarget.row);
    };

    vm.toggle = function (squad) {
      if (!squad) {
        return;
      }
      vm.selected[squad.id] = !vm.selected[squad.id];
      vm.status = '';
    };

    vm.isSelected = function (squad) {
      return !!(squad && vm.selected[squad.id]);
    };

    vm.selectedIds = function () {
      var list = vm.squads();
      var ids = [];
      var i;
      for (i = 0; i < list.length; i += 1) {
        if (vm.selected[list[i].id]) {
          ids.push(list[i].id);
        }
      }
      return ids;
    };

    vm.canTravel = function () {
      return vm.selectedIds().length > 0;
    };

    vm.travel = function () {
      var ids = vm.selectedIds();
      if (!ids.length) {
        vm.status = 'Select at least one squad.';
        return;
      }
      if (!game || !game.moveTarget) {
        return;
      }
      game.beginTravel(ids, game.moveTarget);
      vm.selected = {};
      vm.status = '';
    };

    // Reset selection whenever the move target changes
    $scope.$watch(
      function () {
        return game && game.moveTarget
          ? game.moveTarget.col + ',' + game.moveTarget.row
          : '';
      },
      function () {
        vm.selected = {};
        vm.status = '';
      }
    );
  }

  /** Teleport panel: pick idle squads, then aim a curve at an own/ally tunnel. */
  function TeleportCtrl($scope) {
    var vm = this;

    function getGame() {
      return $scope.game;
    }

    vm.status = '';
    vm.selected = {};

    /** Preview min cost (1-tick distance) until destination is pinned. */
    vm.cost = function () {
      var game = getGame();
      var n = vm.selectedIds().length;
      if (!n) {
        return 0;
      }
      if (game && typeof game.teleportCost === 'function') {
        return game.teleportCost(n, 1);
      }
      return n * ((game && game.TELEPORT_COST_PER) || 10);
    };

    vm.costPer = function () {
      var game = getGame();
      return (game && game.TELEPORT_COST_PER) || 10;
    };

    vm.ticks = function () {
      var game = getGame();
      return (game && game.TELEPORT_TICKS) || 1;
    };

    vm.chemicals = function () {
      var game = getGame();
      return game && typeof game.getResource === 'function'
        ? game.getResource('flask')
        : 0;
    };

    vm.siteLabel = function () {
      var game = getGame();
      return (
        (game && game.teleportTarget && game.teleportTarget.siteLabel) ||
        'Sand Tunnel'
      );
    };

    vm.fishSize = function (squad) {
      var game = getGame();
      if (game && typeof game.squadSizeLabel === 'function') {
        return game.squadSizeLabel(squad);
      }
      var max = (game && game.SQUAD_MAX_UNITS) || 15;
      var n = squad && squad.total != null ? squad.total : 0;
      return n + '/' + max;
    };

    vm.squads = function () {
      var game = getGame();
      if (!game || !game.teleportTarget) {
        return [];
      }
      return game.squadsAtCell(
        game.teleportTarget.col,
        game.teleportTarget.row
      );
    };

    vm.toggle = function (squad) {
      if (!squad) {
        return;
      }
      vm.selected[squad.id] = !vm.selected[squad.id];
      vm.status = '';
    };

    vm.isSelected = function (squad) {
      return !!(squad && vm.selected[squad.id]);
    };

    vm.selectedIds = function () {
      var list = vm.squads();
      var ids = [];
      var i;
      for (i = 0; i < list.length; i += 1) {
        if (vm.selected[list[i].id]) {
          ids.push(list[i].id);
        }
      }
      return ids;
    };

    /** Enabled with squads selected — final afford check is at confirm. */
    vm.canTeleport = function () {
      return vm.selectedIds().length > 0;
    };

    vm.teleport = function () {
      var game = getGame();
      var ids = vm.selectedIds();
      if (!ids.length) {
        vm.status = 'Select at least one squad.';
        return;
      }
      if (!game || !game.teleportTarget || !game.beginTeleport) {
        return;
      }
      if (!game.beginTeleport(ids, game.teleportTarget)) {
        vm.status = 'Could not start teleport aim.';
        return;
      }
      vm.selected = {};
      vm.status = '';
    };

    $scope.$watch(
      function () {
        var game = getGame();
        return game && game.teleportTarget
          ? game.teleportTarget.col + ',' + game.teleportTarget.row
          : '';
      },
      function () {
        vm.selected = {};
        vm.status = '';
      }
    );
  }

  /** Build panel: coral reef / shell radar / sand tunnel. */
  function BuildCtrl($scope) {
    var vm = this;
    var game = $scope.game;

    vm.status = '';
    vm.cost = (game && game.BUILD_COST) || 300;
    vm.options = [
      {
        id: 'coral-reef',
        name: 'Coral Reef',
        desc: 'Main base — only one allowed.',
      },
      {
        id: 'shell-radar',
        name: 'Shell Radar',
        desc: 'Requires your Coral Reef first.',
      },
      {
        id: 'sand-tunnel',
        name: 'Sand Tunnel',
        desc: 'Requires your Coral Reef first.',
      },
    ];

    vm.scrap = function () {
      return game && game.getResource ? game.getResource('scrap') : 0;
    };

    vm.isDisabled = function (option) {
      if (!option || !game) {
        return true;
      }
      var hasReef = game.hasOwnCoralReef && game.hasOwnCoralReef();
      if (option.id === 'coral-reef') {
        return !!hasReef;
      }
      // Shell radar / sand tunnel locked until own Coral Reef exists
      if (option.id === 'shell-radar' || option.id === 'sand-tunnel') {
        return !hasReef;
      }
      return false;
    };

    vm.disableReason = function (option) {
      if (!option || !vm.isDisabled(option)) {
        return '';
      }
      if (option.id === 'coral-reef') {
        return 'You already own a Coral Reef.';
      }
      return 'Build your Coral Reef first.';
    };

    vm.pick = function (option) {
      if (!option || !game || !game.buildTarget) {
        return;
      }
      if (vm.isDisabled(option)) {
        vm.status = vm.disableReason(option);
        return;
      }
      if (!game.spendScrap || !game.spendScrap(vm.cost)) {
        vm.status = 'Need ' + vm.cost + ' scraps to build.';
        return;
      }
      if (typeof game.placeBuilding === 'function') {
        var placed = game.placeBuilding(game.buildTarget, option.id, 'own');
        if (!placed) {
          // Refund if place failed (spendScrap already deducted)
          game.resourceAmounts.scrap += vm.cost;
          if (typeof game.syncResources === 'function') {
            game.syncResources();
          }
          vm.status = 'Could not place building.';
          return;
        }
      }
      vm.status = '';
      game.closeBuild();
    };
  }

  /** Chat: Global / Alliance tabs with acronym tags. */
  function ChatCtrl($scope) {
    var vm = this;
    var game = $scope.game;

    vm.tab = (game && game.chatTab) || 'global'; // global | alliance
    vm.draft = '';

    vm.globalMessages = [
      {
        id: 'g1',
        user: 'AquaAdmin',
        alliance: null,
        text: 'Server reset in 10 minutes.',
      },
      {
        id: 'g2',
        user: 'TideLord',
        alliance: 'SHL',
        text: 'Anyone farming the north reef?',
      },
      {
        id: 'g3',
        user: 'CaptainShelly',
        alliance: 'AQA',
        text: 'Heading out with Reef Raiders.',
      },
      {
        id: 'g4',
        user: 'CoralKing',
        alliance: null,
        text: 'Trade scrap for pearls — whisper me.',
      },
      {
        id: 'g5',
        user: 'WaveSniper',
        alliance: 'BLU',
        text: 'Enemy squad spotted near hex 44.',
      },
    ];

    vm.allianceMessages = [
      {
        id: 'a1',
        user: 'CaptainShelly',
        alliance: 'AQA',
        text: 'Rally at the clam beds next tick.',
      },
      {
        id: 'a2',
        user: 'ReefRunner',
        alliance: 'AQA',
        text: 'On my way — 3 ticks out.',
      },
      {
        id: 'a3',
        user: 'PearlFox',
        alliance: 'AQA',
        text: 'Need 200 scrap for the wall.',
      },
      {
        id: 'a4',
        user: 'CaptainShelly',
        alliance: 'AQA',
        text: 'Sending a ready squad now.',
      },
    ];

    vm.setTab = function (tab) {
      vm.tab = tab === 'alliance' ? 'alliance' : 'global';
      vm.draft = '';
      if (game && game.setChatTab) {
        game.setChatTab(vm.tab);
      }
    };

    vm.messages = function () {
      return vm.tab === 'alliance' ? vm.allianceMessages : vm.globalMessages;
    };

    vm.displayName = function (msg) {
      if (!msg) {
        return '';
      }
      var tag = msg.alliance ? String(msg.alliance).slice(0, 3).toUpperCase() : '';
      if (tag) {
        return '[' + tag + '] ' + msg.user;
      }
      return msg.user;
    };

    vm.send = function () {
      var text = String(vm.draft || '').trim();
      if (!text) {
        return;
      }
      var list = vm.messages();
      list.push({
        id: 'c' + Date.now(),
        user: 'CaptainShelly',
        alliance: 'AQA',
        text: text,
      });
      vm.draft = '';
    };
  }

  /**
   * Radar: live travel contacts —
   * attacks on you / ally, and ally moves to ally or owned structures.
   */
  function RadarCtrl($scope) {
    var vm = this;

    function getGame() {
      return $scope.game;
    }

    vm.status = '';

    vm.contacts = function () {
      var game = getGame();
      if (game && typeof game.radarContacts === 'function') {
        return game.radarContacts();
      }
      return [];
    };

    vm.sideLabel = function (item) {
      if (!item) {
        return '';
      }
      var kind =
        item.kind === 'attack'
          ? 'Attack'
          : item.kind === 'move'
            ? 'Ally move'
            : item.side === 'enemy'
              ? 'Enemy'
              : 'Ally';
      var eta = item.eta != null ? item.eta : 0;
      return kind + ' · ' + eta + ' ticks';
    };

    vm.goContact = function (item) {
      var game = getGame();
      if (!item || !game) {
        return;
      }
      var col = item.col;
      var row = item.row;
      if (
        col != null &&
        row != null &&
        typeof game.focusMapCell === 'function'
      ) {
        game.focusMapCell(col, row);
        vm.status = 'Viewing ' + (item.name || 'contact') + '.';
        game.closeRadar();
        return;
      }
      vm.status = 'No location for ' + (item.name || 'contact') + '.';
    };
  }

  /** Alliance: members Go, announcements → mail, join Approve/Deny for leader. */
  function AllianceCtrl($scope, MailStore) {
    var vm = this;
    var nextMemberId = 4;
    var nextJoinId = 3;
    var nextMailLocal = 1;

    function getGame() {
      return $scope.game;
    }

    vm.status = '';
    vm.newName = '';
    vm.newTag = '';
    vm.view = 'main'; // main | announce
    vm.announceBody = '';
    vm.allianceName = 'Aqua Alliance';
    vm.allianceTag = 'AQA';
    vm.isLeader = true;
    vm.selfId = 'm1';
    vm.members = [
      {
        id: 'm1',
        name: 'CaptainShelly',
        role: 'leader',
        col: 49,
        row: 5,
      },
      {
        id: 'm2',
        name: 'ReefRunner',
        role: 'member',
        col: 45,
        row: 4,
      },
      {
        id: 'm3',
        name: 'PearlFox',
        role: 'member',
        col: 46,
        row: 4,
      },
    ];
    // Pending join requests (leader reviews)
    vm.joinRequests = [
      { id: 'j1', name: 'CoralNomad', col: 44, row: 8 },
      { id: 'j2', name: 'SandWalker', col: 52, row: 5 },
    ];

    vm.hasAlliance = function () {
      return !!vm.allianceName;
    };

    vm.roleLabel = function (member) {
      if (!member) {
        return '';
      }
      return member.role === 'leader' ? 'Leader' : 'Member';
    };

    vm.canKick = function (member) {
      return (
        vm.isLeader &&
        member &&
        member.id !== vm.selfId &&
        member.role !== 'leader'
      );
    };

    vm.canGo = function (person) {
      return !!(person && person.col != null && person.row != null);
    };

    vm.goPerson = function (person) {
      var game = getGame();
      if (!person || !game) {
        return;
      }
      var selfName = (
        (game.captain && game.captain.name) ||
        ''
      ).toLowerCase();
      if (String(person.name || '').toLowerCase() === selfName) {
        if (game.focusHomeReef && game.focusHomeReef()) {
          vm.status = 'Viewing your Coral Reef.';
          game.closeAlliance();
          return;
        }
      }
      if (
        person.col != null &&
        person.row != null &&
        typeof game.focusMapCell === 'function'
      ) {
        game.focusMapCell(person.col, person.row);
        vm.status = 'Viewing ' + person.name + '.';
        game.closeAlliance();
        return;
      }
      vm.status = 'No location for ' + (person.name || 'player') + '.';
    };

    vm.openAnnounce = function () {
      if (!vm.isLeader) {
        return;
      }
      vm.view = 'announce';
      vm.announceBody = '';
      vm.status = '';
    };

    vm.backToMain = function () {
      vm.view = 'main';
      vm.status = '';
    };

    vm.canSendAnnounce = function () {
      return vm.isLeader && String(vm.announceBody || '').trim().length > 0;
    };

    /** Leader announcement → unread mail for members (player inbox). */
    vm.sendAnnounce = function () {
      var game = getGame();
      var body = String(vm.announceBody || '').trim();
      var tag = vm.allianceTag || 'ALL';
      var from = '[' + tag + '] ' + (vm.allianceName || 'Alliance');
      var preview;
      if (!vm.canSendAnnounce()) {
        vm.status = 'Enter a message.';
        return;
      }
      if (!MailStore || typeof MailStore.add !== 'function') {
        vm.status = 'Mail unavailable.';
        return;
      }
      preview = body.slice(0, 100);
      nextMailLocal += 1;
      MailStore.add({
        id: 'ann' + nextMailLocal,
        from: from,
        preview: preview,
        body:
          'Alliance Announcement\n\n' +
          body +
          '\n\n— ' +
          ((game && game.captain && game.captain.name) || 'Leader') +
          ' (' +
          tag +
          ')',
        time: 'Just now',
        unread: true,
      });
      if (game) {
        game.notifications = (game.notifications || 0) + 1;
      }
      vm.announceBody = '';
      vm.view = 'main';
      vm.status = 'Announcement sent to members’ mail.';
    };

    vm.createAlliance = function () {
      var name = String(vm.newName || '').trim();
      var tag = String(vm.newTag || '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 3);
      var game = getGame();
      var selfName =
        (game && game.captain && game.captain.name) || 'CaptainShelly';
      if (!name) {
        vm.status = 'Enter an alliance name.';
        return;
      }
      if (tag.length !== 3) {
        vm.status = 'Enter a 3-letter acronym.';
        return;
      }
      vm.allianceName = name;
      vm.allianceTag = tag;
      vm.isLeader = true;
      vm.selfId = 'm1';
      vm.members = [
        {
          id: 'm1',
          name: selfName,
          role: 'leader',
          col: 49,
          row: 5,
        },
      ];
      nextMemberId = 2;
      nextJoinId = 3;
      vm.joinRequests = [
        { id: 'j1', name: 'TideSeeker', col: 48, row: 7 },
        { id: 'j2', name: 'ShellPilot', col: 44, row: 8 },
      ];
      vm.newName = '';
      vm.newTag = '';
      vm.view = 'main';
      vm.status = '';
    };

    vm.approveJoin = function (req) {
      if (!vm.isLeader || !req) {
        return;
      }
      nextMemberId += 1;
      vm.members.push({
        id: 'm' + nextMemberId,
        name: req.name,
        role: 'member',
        col: req.col,
        row: req.row,
      });
      vm.joinRequests = vm.joinRequests.filter(function (r) {
        return r.id !== req.id;
      });
      vm.status = 'Approved ' + req.name + '.';
    };

    vm.denyJoin = function (req) {
      if (!vm.isLeader || !req) {
        return;
      }
      vm.joinRequests = vm.joinRequests.filter(function (r) {
        return r.id !== req.id;
      });
      vm.status = 'Denied ' + req.name + '.';
    };

    vm.kickMember = function (member) {
      if (!vm.canKick(member)) {
        return;
      }
      vm.members = vm.members.filter(function (m) {
        return m.id !== member.id;
      });
      vm.status = 'Kicked ' + member.name + '.';
    };

    // Demo helper: clear alliance to show create form
    vm.leaveAlliance = function () {
      vm.allianceName = '';
      vm.allianceTag = '';
      vm.members = [];
      vm.joinRequests = [];
      vm.isLeader = false;
      vm.newName = '';
      vm.newTag = '';
      vm.view = 'main';
      vm.announceBody = '';
      vm.status = '';
    };
  }

  /** Compose a private message to a coral-reef owner (from structure Message action). */
  function ComposeMessageCtrl($scope, MailStore) {
    var vm = this;

    function getGame() {
      return $scope.game;
    }

    vm.body = '';
    vm.status = '';

    vm.toName = function () {
      var game = getGame();
      return (
        (game && game.composeTarget && game.composeTarget.name) || 'Captain'
      );
    };

    vm.canSend = function () {
      return String(vm.body || '').trim().length > 0;
    };

    vm.send = function () {
      var game = getGame();
      var body = String(vm.body || '').trim();
      var to = vm.toName();
      var fromName =
        (game && game.captain && game.captain.name) || 'CaptainShelly';
      if (!body) {
        vm.status = 'Enter a message.';
        return;
      }
      if (!MailStore || typeof MailStore.add !== 'function') {
        vm.status = 'Mail unavailable.';
        return;
      }
      MailStore.add({
        from: 'To: ' + to,
        preview: body.slice(0, 100),
        body:
          'Message to ' +
          to +
          '\n\n' +
          body +
          '\n\n— ' +
          fromName,
        time: 'Just now',
        unread: true,
      });
      if (game) {
        game.notifications = (game.notifications || 0) + 1;
        game.closeComposeMessage();
      }
      vm.body = '';
      vm.status = '';
    };

    $scope.$watch(
      function () {
        var game = getGame();
        return game && game.composeTarget
          ? game.composeTarget.name +
              ':' +
              game.composeTarget.col +
              ',' +
              game.composeTarget.row
          : '';
      },
      function () {
        vm.body = '';
        vm.status = '';
      }
    );
  }

  /** Inbox list + detail UI over MailStore sample data. */
  function MessagesCtrl(MailStore) {
    var vm = this;

    vm.view = 'list';
    vm.selected = null;
    vm.items = MailStore.items;

    vm.openItem = function (item) {
      MailStore.markRead(item);
      vm.selected = item;
      vm.view = 'detail';
    };

    vm.backToList = function () {
      vm.selected = null;
      vm.view = 'list';
    };
  }

  /** Territory alerts list + Battle / Scan reports. */
  function AlertsCtrl(AlertStore) {
    var vm = this;

    vm.view = 'list';
    vm.selected = null;
    vm.items = AlertStore.items;

    vm.reportKindLabel = function (item) {
      if (item && item.kind === 'scan') {
        return 'Scan Report';
      }
      return 'Battle Report';
    };

    vm.openItem = function (item) {
      AlertStore.markRead(item);
      vm.selected = item;
      vm.view = 'report';
    };

    vm.backToList = function () {
      vm.selected = null;
      vm.view = 'list';
    };
  }

  /** Settings: username update + VIP upgrade stub. */
  function SettingsCtrl($scope) {
    var vm = this;
    var game = $scope.game;

    vm.username = (game && game.captain && game.captain.name) || 'CaptainShelly';
    vm.updatedFlash = false;

    Object.defineProperty(vm, 'vip', {
      get: function () {
        return !!(game && game.vip);
      },
      set: function (v) {
        if (game) {
          game.vip = !!v;
        }
      },
    });

    vm.updateUsername = function () {
      var name = String(vm.username || '').replace(/\s+/g, '');
      if (!name || !game || !game.captain) {
        return;
      }
      game.captain.name = name;
      vm.username = name;
      vm.updatedFlash = true;
    };

    vm.upgradeVip = function () {
      // Placeholder VIP purchase — +10 extra resources per tick
      if (game) {
        game.vip = true;
      }
    };
  }

  /**
   * Rewards: Daily Login — one claim per day; stays claimed until week reset.
   * State lives on game.dailyLogin so closing the panel does not wipe claims.
   */
  function RewardsCtrl($scope) {
    var vm = this;
    var game = $scope.game;

    function loginState() {
      return game && game.dailyLogin ? game.dailyLogin : null;
    }

    Object.defineProperty(vm, 'currentDay', {
      get: function () {
        var s = loginState();
        return s ? s.currentDay : 1;
      },
    });

    Object.defineProperty(vm, 'daily', {
      get: function () {
        var s = loginState();
        return s ? s.days : [];
      },
    });

    vm.isLocked = function (item) {
      return !item || item.day > vm.currentDay;
    };

    vm.isMissed = function (item) {
      return !!item && item.day < vm.currentDay && !item.claimed;
    };

    /** Only today's unclaimed reward is claimable; claimed days stay locked all week. */
    vm.canClaim = function (item) {
      return (
        !!item &&
        item.day === vm.currentDay &&
        !item.claimed
      );
    };

    vm.iconTpl = function (kind) {
      return 'reward-icon-' + (kind || 'scrap') + '.html';
    };

    vm.claim = function (item) {
      if (!vm.canClaim(item)) {
        return;
      }
      if (game && typeof game.grantResources === 'function') {
        var gains = {};
        var kind = item.kind === 'chem' ? 'flask' : item.kind;
        if (
          kind === 'scrap' ||
          kind === 'flask' ||
          kind === 'energy' ||
          kind === 'fish'
        ) {
          gains[kind] = item.amount || 0;
          game.grantResources(gains);
        }
      }
      item.claimed = true;
      // Stays Claimed for the rest of this week; game.resetDailyLoginWeek() clears all
    };

    vm.claimLabel = function (item) {
      if (!item) {
        return 'Claim';
      }
      if (item.day > vm.currentDay) {
        return 'Locked';
      }
      if (item.claimed) {
        return 'Claimed';
      }
      if (item.day < vm.currentDay) {
        return 'Missed';
      }
      return 'Claim';
    };
  }

  /**
   * Daily Lucky Spin — weighted wheel + CSS spin animation.
   * Odds: VIP 5%; scraps/chemicals/energy/population +50 @ 15% each; miss 35%.
   */
  function SpinCtrl($timeout, $scope) {
    var vm = this;
    var spinTimer = null;
    var game = $scope.game;

    // Odds: VIP 5%; scraps/chem/energy/pop +50 @ 15% each; miss 35%
    vm.prizes = [
      {
        id: 'vip',
        label: 'VIP free 1 week',
        short: 'VIP',
        odds: 5,
        color: '#ffd54a',
        winColor: '#fff3a8',
      },
      {
        id: 'scrap',
        label: '+50 Scraps',
        short: '+50 Scrap',
        odds: 15,
        color: '#7a96a8',
        winColor: '#c5d8e4',
      },
      {
        id: 'chem',
        label: '+50 Chemicals',
        short: '+50 Chem',
        odds: 15,
        color: '#1fd45a',
        winColor: '#7dff9a',
      },
      {
        id: 'energy',
        label: '+50 Energy',
        short: '+50 Energy',
        odds: 15,
        color: '#2a9fef',
        winColor: '#8ad4ff',
      },
      {
        id: 'pop',
        label: '+50 Population',
        short: '+50 Pop',
        odds: 15,
        color: '#ff6b2c',
        winColor: '#ffb08a',
      },
      {
        id: 'miss',
        label: 'Better luck next time',
        short: 'No luck',
        odds: 35,
        color: '#3d5563',
        winColor: '#6a8494',
      },
    ];

    vm.spinning = false;

    function spinState() {
      return game && game.dailySpin ? game.dailySpin : null;
    }

    function prizeById(id) {
      var i;
      for (i = 0; i < vm.prizes.length; i += 1) {
        if (vm.prizes[i].id === id) {
          return vm.prizes[i];
        }
      }
      return null;
    }

    // Restore today's result if the panel was closed after spinning
    (function restoreTodaySpin() {
      var st = spinState();
      if (st && st.usedToday && st.resultId) {
        vm.result = prizeById(st.resultId);
        vm.winId = st.resultId;
        vm.rotation = st.rotation || 0;
      } else {
        vm.result = null;
        vm.winId = null;
        vm.rotation = (st && st.rotation) || 0;
      }
    })();

    vm.canSpin = function () {
      var st = spinState();
      return !(st && st.usedToday);
    };

    // Divider between slices (degrees). Kept out of the landable fill.
    var SEG_GAP_DEG = 2.5;

    function mod360(deg) {
      return ((deg % 360) + 360) % 360;
    }

    // Odds% → degrees. Shared by gradient paint AND pin math (single source of truth).
    function segmentBounds(prizeIndex) {
      var startPct = 0;
      var i;
      for (i = 0; i < prizeIndex; i += 1) {
        startPct += vm.prizes[i].odds;
      }
      var spanPct = vm.prizes[prizeIndex].odds;
      var startDeg = startPct * 3.6;
      var endDeg = (startPct + spanPct) * 3.6;
      var gap = Math.min(SEG_GAP_DEG, Math.max(0, endDeg - startDeg - 1));
      var fillEndDeg = endDeg - gap;
      return {
        startDeg: startDeg,
        fillEndDeg: fillEndDeg,
        endDeg: endDeg,
        midDeg: (startDeg + fillEndDeg) / 2,
      };
    }

    function buildConic(prizes, winId) {
      var parts = [];
      var i;
      var b;
      var fill;
      // Use degree stops (not %) so paint angles match rotation math exactly.
      // from 0deg = 12 o'clock (pointer); angles increase clockwise.
      for (i = 0; i < prizes.length; i += 1) {
        b = segmentBounds(i);
        fill = prizes[i].color;
        if (winId) {
          fill =
            prizes[i].id === winId
              ? prizes[i].winColor || prizes[i].color
              : '#1a2a34';
        }
        parts.push(
          fill + ' ' + b.startDeg + 'deg ' + b.fillEndDeg + 'deg'
        );
        parts.push(
          '#0c1820 ' + b.fillEndDeg + 'deg ' + b.endDeg + 'deg'
        );
      }
      return 'conic-gradient(from 0deg, ' + parts.join(', ') + ')';
    }

    vm.wheelStyle = function () {
      return {
        background: buildConic(vm.prizes, vm.winId),
        transform: 'rotate(' + vm.rotation + 'deg)',
        transformOrigin: '50% 50%',
      };
    };

    vm.isReward = function () {
      return !!(vm.result && vm.result.id !== 'miss');
    };

    vm.resultStyle = function () {
      if (!vm.result) {
        return {};
      }
      var darkText = vm.result.id !== 'miss' && vm.result.id !== 'scrap';
      return {
        color: darkText ? '#1a1208' : '#fff8e8',
        borderColor: vm.result.winColor || vm.result.color,
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 42%), ' +
          vm.result.color,
        textShadow: darkText
          ? '0 1px 0 rgba(255,255,255,0.35)'
          : '0 1px 0 rgba(0,0,0,0.45)',
      };
    };

    // Weighted pick by odds% (unchanged bands: 5 / 15×4 / 35).
    // Returns prize + the exact local conic angle we will park under the pin.
    function pickLanding() {
      var roll = Math.random() * 100;
      var cursor = 0;
      var i;
      var b;
      var t;
      var fillSpan;
      for (i = 0; i < vm.prizes.length; i += 1) {
        cursor += vm.prizes[i].odds;
        if (roll < cursor) {
          b = segmentBounds(i);
          // Map roll within the odds band → a point inside the painted fill
          t = (roll - (cursor - vm.prizes[i].odds)) / vm.prizes[i].odds;
          t = 0.18 + t * 0.64; // keep off the divider edges
          fillSpan = Math.max(0.5, b.fillEndDeg - b.startDeg);
          return {
            prize: vm.prizes[i],
            index: i,
            landDeg: b.startDeg + t * fillSpan,
          };
        }
      }
      b = segmentBounds(vm.prizes.length - 1);
      return {
        prize: vm.prizes[vm.prizes.length - 1],
        index: vm.prizes.length - 1,
        landDeg: b.midDeg,
      };
    }

    // Local conic angle under the fixed top pointer for wheel rotation R.
    // CSS positive rotate() is clockwise; with conic from 0deg at 12 o'clock,
    // the color under the pin is at local angle (-R) mod 360.
    function angleUnderPin(rotationDeg) {
      return mod360(-rotationDeg);
    }

    function prizeAtLocalAngle(localDeg) {
      var a = mod360(localDeg);
      var i;
      var b;
      for (i = 0; i < vm.prizes.length; i += 1) {
        b = segmentBounds(i);
        if (a >= b.startDeg && a < b.endDeg) {
          return vm.prizes[i];
        }
      }
      return vm.prizes[vm.prizes.length - 1];
    }

    vm.spin = function () {
      if (vm.spinning || !vm.canSpin()) {
        return;
      }
      vm.spinning = true;
      vm.result = null;
      vm.winId = null;

      var landing = pickLanding();
      // Rotate clockwise so local landDeg sits under the top pin:
      // angleUnderPin(R) === landDeg  ⇒  R ≡ -landDeg (mod 360)
      var targetMod = mod360(-landing.landDeg);
      var currentMod = mod360(vm.rotation);
      var delta = mod360(targetMod - currentMod);
      if (delta < 20) {
        delta += 360;
      }
      var turns = 4 + Math.floor(Math.random() * 3);
      var finalRotation = vm.rotation + turns * 360 + delta;
      vm.rotation = finalRotation;

      if (spinTimer) {
        $timeout.cancel(spinTimer);
      }
      spinTimer = $timeout(function () {
        // Snap rotation so the pin angle is exactly landDeg (no transition residual)
        var turnsKept = Math.floor(finalRotation / 360);
        vm.rotation = turnsKept * 360 + targetMod;
        var under = prizeAtLocalAngle(angleUnderPin(vm.rotation));
        // If paint/rotation ever disagree, force-correct to the weighted landing
        if (!under || under.id !== landing.prize.id) {
          vm.rotation = turnsKept * 360 + mod360(-landing.landDeg);
          under = landing.prize;
        }
        vm.spinning = false;
        vm.result = under;
        vm.winId = under.id;
        // Lock for the rest of the day (survives closing the panel)
        if (game && game.dailySpin) {
          game.dailySpin.usedToday = true;
          game.dailySpin.resultId = under.id;
          game.dailySpin.rotation = vm.rotation;
        }
        if (game) {
          if (under.id === 'vip') {
            game.vip = true;
          } else if (
            typeof game.grantResources === 'function' &&
            under.id !== 'miss'
          ) {
            if (under.id === 'scrap') {
              game.grantResources({ scrap: 50 });
            } else if (under.id === 'chem') {
              game.grantResources({ flask: 50 });
            } else if (under.id === 'energy') {
              game.grantResources({ energy: 50 });
            } else if (under.id === 'pop') {
              game.grantResources({ fish: 50 });
            }
          }
        }
        spinTimer = null;
      }, 4200);
    };
  }

  /** Ranking: Current Era & Previous Era top 5 (sample). */
  function RankingCtrl($scope) {
    var vm = this;

    function getGame() {
      return $scope.game;
    }

    vm.tab = 'current';

    // alliance: up to 3-letter acronym (optional); vip → diamond frame
    // Self row score is live from Stats (playerScore) when Current Era is shown
    vm.currentEra = [
      { rank: 1, name: 'TideLord', alliance: 'SHL', score: 18420, vip: true },
      {
        rank: 2,
        name: 'CaptainShelly',
        alliance: 'AQA',
        score: 0,
        vip: false,
        isSelf: true,
      },
      { rank: 3, name: 'ReefRunner', alliance: 'RFT', score: 14950, vip: false },
      { rank: 4, name: 'CoralKing', alliance: null, score: 13110, vip: true },
      { rank: 5, name: 'WaveSniper', alliance: 'BLU', score: 11840, vip: false },
    ];

    vm.previousEra = [
      { rank: 1, name: 'DeepKraken', alliance: 'NKN', score: 22100, vip: true },
      { rank: 2, name: 'PearlFox', alliance: 'SHL', score: 19870, vip: false },
      { rank: 3, name: 'SandBaron', alliance: 'GLD', score: 17640, vip: true },
      { rank: 4, name: 'MantaMike', alliance: null, score: 15420, vip: false },
      { rank: 5, name: 'ShellWitch', alliance: 'HEX', score: 14290, vip: false },
    ];

    vm.setTab = function (tab) {
      vm.tab = tab;
    };

    /** Current Era with live self score from Stats formula, re-ranked. */
    vm.liveCurrentEra = function () {
      var game = getGame();
      var selfName =
        (game && game.captain && game.captain.name) || 'CaptainShelly';
      var liveScore =
        game && typeof game.playerScore === 'function'
          ? game.playerScore()
          : 0;
      var list = [];
      var i;
      var row;
      var copy;
      for (i = 0; i < vm.currentEra.length; i += 1) {
        row = vm.currentEra[i];
        copy = {
          rank: row.rank,
          name: row.name,
          alliance: row.alliance,
          score: row.score,
          vip: !!row.vip,
          isSelf: !!row.isSelf,
        };
        if (row.isSelf) {
          copy.name = selfName;
          copy.score = liveScore;
          copy.vip = !!(game && game.vip);
        }
        list.push(copy);
      }
      list.sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      });
      for (i = 0; i < list.length; i += 1) {
        list[i].rank = i + 1;
      }
      return list;
    };

    vm.activeList = function () {
      return vm.tab === 'previous' ? vm.previousEra : vm.liveCurrentEra();
    };

    vm.formatScore = function (n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
  }

  /**
   * Builds a continuous sand hex lattice once (no ng-repeat),
   * then enables pointer/touch pan on the land stage.
   */
  function hexFieldDirective() {
    return {
      restrict: 'A',
      scope: {
        cols: '=',
        rows: '=',
        hexW: '=',
        hexH: '=',
      },
      link: function (scope, element) {
        var stage = element[0];
        var grid = stage.querySelector('.hex-grid');
        var layer = stage.querySelector('.hex-layer');
        if (!grid || !layer) {
          return;
        }

        var cols = scope.cols || 100;
        var rows = scope.rows || 100;
        var hexW = scope.hexW || 84;
        var hexH = scope.hexH || 96;
        var rowPitch = hexH * 0.75;
        // Thin water rim — keep border sand usable while panning
        var waterMargin = 56;
        var sandW = cols * hexW + hexW / 2;
        var sandH = rows * rowPitch + hexH * 0.25;
        var mapW = sandW + waterMargin * 2;
        var mapH = sandH + waterMargin * 2;
        var cx = (cols - 1) / 2;
        var cy = (rows - 1) / 2;
        var halfCols = cols / 2;
        var halfRows = rows / 2;

        // Regular-ish octagon in normalized cell space (|x|+|y| <= √2)
        function inOctagon(col, row) {
          var nx = (col - cx) / halfCols;
          var ny = (row - cy) / halfRows;
          var ax = Math.abs(nx);
          var ay = Math.abs(ny);
          return ax <= 1 && ay <= 1 && ax + ay <= Math.SQRT2;
        }

        grid.style.width = mapW + 'px';
        grid.style.height = mapH + 'px';
        grid.style.setProperty('--hex-w', hexW + 'px');
        grid.style.setProperty('--hex-h', hexH + 'px');
        grid.style.setProperty('--row-pitch', rowPitch + 'px');
        grid.style.setProperty('--water-margin', waterMargin + 'px');
        grid.style.setProperty('--sand-w', sandW + 'px');
        grid.style.setProperty('--sand-h', sandH + 'px');

        var plate = grid.querySelector('.hex-sand-plate');
        if (plate) {
          plate.style.width = sandW + 'px';
          plate.style.height = sandH + 'px';
          plate.style.left = waterMargin + 'px';
          plate.style.top = waterMargin + 'px';
          // Match octagon cut (percent of sand plate)
          plate.style.clipPath =
            'polygon(29.3% 0%, 70.7% 0%, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0% 70.7%, 0% 29.3%)';
        }

        // One-shot DOM build — skip corner cells outside the octagon
        var frag = document.createDocumentFragment();
        var r;
        var c;
        var cell;
        var cellIndex = {};
        for (r = 0; r < rows; r += 1) {
          for (c = 0; c < cols; c += 1) {
            if (!inOctagon(c, r)) {
              continue;
            }
            cell = document.createElement('div');
            cell.className = 'hex';
            cell.setAttribute('data-col', String(c));
            cell.setAttribute('data-row', String(r));
            cell.style.left =
              waterMargin + c * hexW + (r % 2 ? hexW / 2 : 0) + 'px';
            cell.style.top = waterMargin + r * rowPitch + 'px';
            cellIndex[c + ',' + r] = cell;
            frag.appendChild(cell);
          }
        }
        layer.appendChild(frag);

        var buildBtn = grid.querySelector('.hex-build-btn');
        var actionsEl = grid.querySelector('.hex-actions');
        var selectLayer = grid.querySelector('.hex-select-layer');
        var travelSvg = grid.querySelector('.hex-travel-svg');
        var travelRoutesG = travelSvg
          ? travelSvg.querySelector('.hex-travel-routes')
          : null;
        var travelPath = travelSvg
          ? travelSvg.querySelector('.hex-travel-path--preview')
          : null;
        var travelLabel = travelSvg
          ? travelSvg.querySelector('.hex-travel-label--preview')
          : null;
        var travelSquads = grid.querySelector('.hex-travel-squads');
        var travelActionsEl = grid.querySelector('.hex-travel-actions');
        if (travelSvg) {
          travelSvg.setAttribute('width', String(mapW));
          travelSvg.setAttribute('height', String(mapH));
          travelSvg.setAttribute('viewBox', '0 0 ' + mapW + ' ' + mapH);
        }
        var selectedCell = null;
        var selectHalo = null;
        var selectFront = null;
        var siteCounters = {
          'coral-reef': 0,
          'shell-radar': 0,
          'sand-tunnel': 0,
        };
        var SITE_NAME_PREFIX = {
          'coral-reef': 'Coral Reef',
          'shell-radar': 'Shell Radar',
          'sand-tunnel': 'Sand Tunnel',
        };

        var STRUCTURE_ACTIONS = {
          'coral-reef': ['scan', 'move', 'profile', 'message'],
          'sand-tunnel': ['scan', 'move', 'profile', 'teleport'],
          'shell-radar': ['scan', 'profile', 'move'],
        };

        var ACTION_LABELS = {
          scan: 'Scan',
          move: 'Move',
          profile: 'Profile',
          message: 'Message',
          teleport: 'Teleport',
          flag: 'Toggle mark',
        };

        var OWNER_MARKS = ['own', 'ally', 'enemy', 'neutral'];

        function normalizeOwnerMark(owner) {
          return OWNER_MARKS.indexOf(owner) >= 0 ? owner : 'own';
        }

        function reefLabelForMark(mark, playerName) {
          if (mark === 'own') {
            return playerName || 'CaptainShelly';
          }
          if (mark === 'ally') {
            return 'Ally Reef';
          }
          if (mark === 'enemy') {
            return 'Enemy Reef';
          }
          return 'Neutral Reef';
        }

        function getTravelState() {
          var s = getGameScope();
          return s && s.game ? s.game.travel : null;
        }

        function hexDistance(c1, r1, c2, r2) {
          // Odd-row offset → cube distance
          var col1 = Number(c1);
          var row1 = Number(r1);
          var col2 = Number(c2);
          var row2 = Number(r2);
          var x1 = col1 - (row1 - (row1 & 1)) / 2;
          var z1 = row1;
          var y1 = -x1 - z1;
          var x2 = col2 - (row2 - (row2 & 1)) / 2;
          var z2 = row2;
          var y2 = -x2 - z2;
          return Math.max(
            Math.abs(x1 - x2),
            Math.abs(y1 - y2),
            Math.abs(z1 - z2)
          );
        }

        function travelTicksFor(c1, r1, c2, r2) {
          return Math.max(1, Math.round(hexDistance(c1, r1, c2, r2)));
        }

        function clientToMap(clientX, clientY) {
          var rect = stage.getBoundingClientRect();
          return {
            x: clientX - rect.left - ox,
            y: clientY - rect.top - oy,
          };
        }

        function curvePath(x1, y1, x2, y2) {
          var mx = (x1 + x2) / 2;
          var my = (y1 + y2) / 2;
          var dx = x2 - x1;
          var dy = y2 - y1;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          var bulge = Math.min(90, len * 0.38);
          var cx = mx - (dy / len) * bulge;
          var cy = my + (dx / len) * bulge;
          return {
            d: 'M ' + x1 + ' ' + y1 + ' Q ' + cx + ' ' + cy + ' ' + x2 + ' ' + y2,
            cx: cx,
            cy: cy,
            midX: (x1 + 2 * cx + x2) / 4,
            midY: (y1 + 2 * cy + y2) / 4,
          };
        }

        // Point on quadratic curve at t ∈ [0,1]
        function bezierPoint(x1, y1, cx, cy, x2, y2, t) {
          var u = 1 - t;
          return {
            x: u * u * x1 + 2 * u * t * cx + t * t * x2,
            y: u * u * y1 + 2 * u * t * cy + t * t * y2,
          };
        }

        // Tangent of quadratic curve at t (for facing along the path)
        function bezierTangent(x1, y1, cx, cy, x2, y2, t) {
          var u = 1 - t;
          return {
            x: 2 * u * (cx - x1) + 2 * t * (x2 - cx),
            y: 2 * u * (cy - y1) + 2 * t * (y2 - cy),
          };
        }

        function travelVisible(travel) {
          return !!(
            travel &&
            ((travel.active && travel.origin) ||
              (travel.routes && travel.routes.length))
          );
        }

        function facingDegToTarget(x1, y1, x2, y2) {
          // Stingray asset faces up (north). CSS rotate is clockwise from up.
          return (Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI;
        }

        function clearPreviewPath() {
          if (travelPath) {
            travelPath.setAttribute('d', '');
            travelPath.classList.remove(
              'is-attack',
              'is-warn',
              'is-move',
              'is-teleport',
              'is-committed'
            );
          }
          if (travelLabel) {
            travelLabel.textContent = '';
          }
        }

        function hideAllTravel() {
          if (travelSvg) {
            travelSvg.setAttribute('hidden', '');
            travelSvg.style.display = 'none';
          }
          clearPreviewPath();
          if (travelRoutesG) {
            travelRoutesG.innerHTML = '';
          }
          if (travelSquads) {
            travelSquads.innerHTML = '';
          }
          hideTravelActions();
        }

        function hideTravelActions() {
          if (!travelActionsEl) {
            return;
          }
          travelActionsEl.hidden = true;
          travelActionsEl.innerHTML = '';
        }

        function clearTravelSelectionUi() {
          hideTravelActions();
          if (travelSquads) {
            var sel = travelSquads.querySelectorAll(
              '.hex-travel-squad.is-selected'
            );
            var i;
            for (i = 0; i < sel.length; i += 1) {
              sel[i].classList.remove('is-selected');
            }
          }
        }

        function showTravelReturnAction(route, mapX, mapY) {
          if (!travelActionsEl || !route || !route.owned) {
            hideTravelActions();
            return;
          }
          travelActionsEl.innerHTML = '';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'hex-action hex-action--return';
          btn.setAttribute('data-action', 'return');
          btn.setAttribute('aria-label', 'Return');
          var ico = document.createElement('span');
          ico.className = 'hex-action-ico hex-action-ico--return';
          ico.setAttribute('aria-hidden', 'true');
          btn.appendChild(ico);
          btn.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var s = getGameScope();
            if (s && s.game && typeof s.game.returnTravel === 'function') {
              s.$applyAsync(function () {
                s.game.returnTravel(route.id);
              });
            }
          });
          btn.addEventListener(
            'pointerdown',
            function (ev) {
              ev.stopPropagation();
            },
            { passive: false }
          );
          travelActionsEl.appendChild(btn);
          travelActionsEl.style.left = mapX + 'px';
          travelActionsEl.style.top = mapY + 'px';
          travelActionsEl.hidden = false;
        }

        function selectTravelRoute(routeId) {
          var travel = getTravelState();
          if (!travel || !travel.routes) {
            return;
          }
          var route = null;
          var i;
          for (i = 0; i < travel.routes.length; i += 1) {
            if (travel.routes[i] && travel.routes[i].id === routeId) {
              route = travel.routes[i];
              break;
            }
          }
          if (!route || !route.owned) {
            return;
          }
          clearHexSelection();
          travel.selectedRouteId = routeId;
          // Force redraw / action placement via digest
          var s = getGameScope();
          if (s) {
            s.$applyAsync(function () {
              /* selectedRouteId watched */
            });
          }
          refreshCommittedTravel();
        }

        // 1 squad → solo; 2–3 → pack; 4+ → fleet
        function stingraySrcForCount(count) {
          var n = count || 1;
          if (n > 3) {
            return '/img/squad-stingray-fleet.png';
          }
          if (n > 1) {
            return '/img/squad-stingray-pack.png';
          }
          return '/img/squad-stingray.png';
        }

        function ensureSquadEl(route) {
          if (!travelSquads || !route) {
            return null;
          }
          var routeId = route.id;
          var src = stingraySrcForCount(
            route.squadCount || (route.squadIds && route.squadIds.length) || 1
          );
          var el = travelSquads.querySelector(
            '[data-route-id="' + routeId + '"]'
          );
          if (el) {
            if (el.getAttribute('src') !== src) {
              el.src = src;
            }
            el.classList.toggle('is-owned', !!route.owned);
            el.classList.toggle('is-selectable', !!route.owned);
            return el;
          }
          el = document.createElement('img');
          el.className =
            'hex-travel-squad is-enroute' +
            (route.owned ? ' is-owned is-selectable' : '');
          el.src = src;
          el.alt = '';
          el.draggable = false;
          el.setAttribute('data-route-id', routeId);
          if (route.owned) {
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', 'Select travelling squad');
            el.removeAttribute('aria-hidden');
          } else {
            el.setAttribute('aria-hidden', 'true');
          }
          el.addEventListener(
            'pointerdown',
            function (ev) {
              if (!route.owned) {
                return;
              }
              // Don't start a map pan when tapping an owned squad
              ev.stopPropagation();
            },
            { passive: false }
          );
          el.addEventListener('click', function (ev) {
            if (!route.owned) {
              return;
            }
            ev.preventDefault();
            ev.stopPropagation();
            selectTravelRoute(routeId);
          });
          travelSquads.appendChild(el);
          return el;
        }

        function drawCommittedRoute(route) {
          if (!route || !route.origin || !route.pinned || !travelRoutesG) {
            return;
          }
          var x1 = route.origin.left + hexW / 2;
          var y1 = route.origin.top + hexH / 2;
          var x2 = route.pinned.left + hexW / 2;
          var y2 = route.pinned.top + hexH / 2;
          var curve = curvePath(x1, y1, x2, y2);
          var path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          );
          path.setAttribute('d', curve.d);
          path.setAttribute(
            'class',
            'hex-travel-path is-committed' +
              (route.kind === 'attack'
                ? ' is-attack'
                : route.kind === 'warn'
                  ? ' is-warn'
                  : route.kind === 'teleport'
                    ? ' is-teleport'
                    : ' is-move')
          );
          travelRoutesG.appendChild(path);

          var t = route.progress != null ? route.progress : 0;
          if (t < 0) {
            t = 0;
          }
          if (t > 1) {
            t = 1;
          }
          var pt = bezierPoint(x1, y1, curve.cx, curve.cy, x2, y2, t);
          var tan = bezierTangent(x1, y1, curve.cx, curve.cy, x2, y2, t);
          var facing =
            Math.abs(tan.x) + Math.abs(tan.y) > 0.01
              ? facingDegToTarget(0, 0, tan.x, tan.y)
              : facingDegToTarget(x1, y1, x2, y2);
          route.facingDeg = facing;

          var label = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          label.setAttribute(
            'class',
            'hex-travel-label'
          );
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('dominant-baseline', 'middle');
          label.setAttribute('x', String(pt.x));
          label.setAttribute('y', String(pt.y - 22));
          label.textContent = (route.ticksLeft || 0) + ' ticks';
          travelRoutesG.appendChild(label);

          var squadEl = ensureSquadEl(route);
          if (squadEl) {
            var count =
              route.squadCount ||
              (route.squadIds && route.squadIds.length) ||
              1;
            var travelSel = getTravelState();
            var isSelected =
              !!(
                travelSel &&
                travelSel.selectedRouteId &&
                travelSel.selectedRouteId === route.id
              );
            squadEl.classList.toggle('is-pack', count > 1 && count <= 3);
            squadEl.classList.toggle('is-fleet', count > 3);
            squadEl.classList.toggle('is-selected', isSelected);
            squadEl.style.left = pt.x + 'px';
            squadEl.style.top = pt.y + 'px';
            squadEl.style.transform =
              'translate(-50%, -50%) rotate(' + facing + 'deg)';
            squadEl.hidden = false;
            if (isSelected) {
              showTravelReturnAction(route, pt.x, pt.y);
            }
          }
        }

        function redrawAllTravel(previewEnd, previewTicks) {
          var travel = getTravelState();
          if (!travelVisible(travel) || !travelSvg) {
            hideAllTravel();
            return;
          }
          travelSvg.removeAttribute('hidden');
          travelSvg.style.display = '';

          // Rebuild committed routes
          if (travelRoutesG) {
            travelRoutesG.innerHTML = '';
          }
          hideTravelActions();
          var liveIds = {};
          var i;
          var routes = (travel && travel.routes) || [];
          var selectedStillLive = false;
          for (i = 0; i < routes.length; i += 1) {
            liveIds[routes[i].id] = true;
            if (
              travel.selectedRouteId &&
              routes[i].id === travel.selectedRouteId
            ) {
              selectedStillLive = true;
            }
            drawCommittedRoute(routes[i]);
          }
          if (travel.selectedRouteId && !selectedStillLive) {
            travel.selectedRouteId = null;
          }
          // Drop stingrays for finished routes
          if (travelSquads) {
            var imgs = travelSquads.querySelectorAll('.hex-travel-squad');
            for (i = 0; i < imgs.length; i += 1) {
              var rid = imgs[i].getAttribute('data-route-id');
              if (!liveIds[rid]) {
                imgs[i].parentNode.removeChild(imgs[i]);
              }
            }
          }

          // Preview path (aiming)
          if (travel.active && travel.origin && previewEnd) {
            var x1 = travel.origin.left + hexW / 2;
            var y1 = travel.origin.top + hexH / 2;
            var curve = curvePath(x1, y1, previewEnd.x, previewEnd.y);
            if (travelPath) {
              travelPath.setAttribute('d', curve.d);
              travelPath.classList.remove('is-committed');
              travelPath.classList.remove(
                'is-attack',
                'is-warn',
                'is-move',
                'is-teleport'
              );
              if (travel.kind === 'attack') {
                travelPath.classList.add('is-attack');
              } else if (travel.kind === 'warn') {
                travelPath.classList.add('is-warn');
              } else if (travel.kind === 'teleport') {
                travelPath.classList.add('is-teleport');
              } else if (travel.kind === 'move') {
                travelPath.classList.add('is-move');
              }
            }
            if (travelLabel) {
              travelLabel.setAttribute('x', String(curve.midX));
              travelLabel.setAttribute('y', String(curve.midY - 22));
              travelLabel.textContent =
                (previewTicks != null ? previewTicks : travel.ticks || 0) +
                (travel.kind === 'teleport' ? ' tick' : ' ticks');
            }
          } else {
            clearPreviewPath();
          }
        }

        function drawTravelCurve(endX, endY, ticks) {
          redrawAllTravel({ x: endX, y: endY }, ticks);
        }

        function refreshCommittedTravel() {
          var travel = getTravelState();
          if (!travel) {
            return;
          }
          if (travel.active && travel.pinned) {
            drawTravelCurve(
              travel.pinned.left + hexW / 2,
              travel.pinned.top + hexH / 2,
              travel.ticks
            );
          } else {
            redrawAllTravel(null, null);
          }
        }

        function updateTravelFollow(clientX, clientY) {
          var travel = getTravelState();
          if (!travel || !travel.active || travel.pinned) {
            return;
          }
          var map = clientToMap(clientX, clientY);
          var hex = hexAtClient(clientX, clientY);
          var ticks = travel.ticks || 0;
          var s = getGameScope();
          if (travel.kind === 'teleport') {
            ticks = (s && s.game && s.game.TELEPORT_TICKS) || 1;
            if (s && s.game) {
              s.game.travel.ticks = ticks;
            }
          } else if (hex) {
            ticks = travelTicksFor(
              travel.origin.col,
              travel.origin.row,
              hex.getAttribute('data-col'),
              hex.getAttribute('data-row')
            );
            if (s && s.game) {
              s.game.travel.ticks = ticks;
              // Preview curve color from hovered structure mark
              if (
                hex.classList.contains('has-building') &&
                typeof s.game.travelLineKind === 'function'
              ) {
                s.game.travel.kind = s.game.travelLineKind(
                  (travel.origin && travel.origin.owner) || 'own',
                  hex.getAttribute('data-owner') || null,
                  true
                );
              }
            }
          }
          drawTravelCurve(map.x, map.y, ticks);
        }

        function pinTravelToHex(hexEl) {
          var travel = getTravelState();
          var s = getGameScope();
          if (!travel || !travel.active || !hexEl || !s || !s.game) {
            return;
          }
          var left = parseFloat(hexEl.style.left) || 0;
          var top = parseFloat(hexEl.style.top) || 0;
          var hasBuilding = hexEl.classList.contains('has-building');
          var owner = hexEl.getAttribute('data-owner') || null;
          var siteLabel = hexEl.getAttribute('data-site-label') || '';
          var buildingId = hexEl.getAttribute('data-building') || '';
          var dest = {
            col: hexEl.getAttribute('data-col'),
            row: hexEl.getAttribute('data-row'),
            left: left,
            top: top,
            owner: owner,
            siteLabel: siteLabel,
            buildingId: buildingId,
            hasBuilding: hasBuilding,
          };
          // Origin cell or empty sand → cancel preview (routes stay)
          var isOrigin =
            travel.origin &&
            String(dest.col) === String(travel.origin.col) &&
            String(dest.row) === String(travel.origin.row);
          if (isOrigin || !hasBuilding) {
            s.$applyAsync(function () {
              s.game.cancelTravelPreview();
              s.game.closeMove();
              s.game.closeTeleport();
            });
            stage.classList.remove('is-travelling');
            redrawAllTravel(null, null);
            return;
          }
          // Teleport: ignore taps on non-friendly tunnels (keep aiming)
          if (
            travel.kind === 'teleport' &&
            (buildingId !== 'sand-tunnel' ||
              (owner !== 'own' && owner !== 'ally'))
          ) {
            return;
          }
          var distanceTicks = travelTicksFor(
            travel.origin.col,
            travel.origin.row,
            dest.col,
            dest.row
          );
          var ticks =
            travel.kind === 'teleport'
              ? s.game.TELEPORT_TICKS || 1
              : distanceTicks;
          if (travel.kind === 'teleport') {
            dest.distanceTicks = distanceTicks;
          }
          s.$applyAsync(function () {
            s.game.travel.ticks = ticks;
            if (travel.kind === 'teleport') {
              s.game.travel.distanceTicks = distanceTicks;
            }
            s.game.pinTravelDestination(dest);
          });
          drawTravelCurve(left + hexW / 2, top + hexH / 2, ticks);
        }

        function refreshPinnedTravel() {
          refreshCommittedTravel();
        }

        function ensureSelectFx() {
          if (!selectHalo) {
            selectHalo = document.createElement('div');
            selectHalo.className = 'hex-select-halo';
            selectHalo.hidden = true;
            grid.appendChild(selectHalo);
          }
          if (!selectFront) {
            selectFront = document.createElement('div');
            selectFront.className = 'hex hex-select-front';
            selectFront.hidden = true;
            if (selectLayer) {
              selectLayer.appendChild(selectFront);
            } else {
              grid.appendChild(selectFront);
            }
          }
          return { halo: selectHalo, front: selectFront };
        }

        function hideStructureActions() {
          if (!actionsEl) {
            return;
          }
          actionsEl.hidden = true;
          actionsEl.innerHTML = '';
        }

        function updateMinimapSiteMark(col, row, mark) {
          if (!miniSites) {
            return;
          }
          var dot = miniSites.querySelector(
            '.minimap-site[data-col="' +
              String(col) +
              '"][data-row="' +
              String(row) +
              '"]'
          );
          if (!dot) {
            return;
          }
          var m = normalizeOwnerMark(mark);
          dot.className = 'minimap-site minimap-site--' + m;
        }

        function pulseMinimapSite(col, row) {
          if (!miniSites) {
            return;
          }
          var dot = miniSites.querySelector(
            '.minimap-site[data-col="' +
              String(col) +
              '"][data-row="' +
              String(row) +
              '"]'
          );
          if (!dot) {
            return;
          }
          dot.classList.remove('is-focus');
          // reflow so the animation can replay
          void dot.offsetWidth;
          dot.classList.add('is-focus');
          window.setTimeout(function () {
            dot.classList.remove('is-focus');
          }, 900);
        }

        /** Locate the coral reef home for a faction mark / structure. */
        function findOwnerCoralReef(hexEl, ownerMark) {
          if (!hexEl) {
            return null;
          }
          var type = hexEl.getAttribute('data-building') || '';
          var reefCol = hexEl.getAttribute('data-owner-reef-col');
          var reefRow = hexEl.getAttribute('data-owner-reef-row');
          if (reefCol != null && reefRow != null) {
            return { col: reefCol, row: reefRow };
          }
          if (type === 'coral-reef') {
            return {
              col: hexEl.getAttribute('data-col'),
              row: hexEl.getAttribute('data-row'),
            };
          }
          var mark = ownerMark || hexEl.getAttribute('data-owner') || '';
          var reefs = grid.querySelectorAll(
            '.hex-structure.hex-structure--coral-reef[data-owner="' + mark + '"]'
          );
          if (reefs.length) {
            return {
              col: reefs[0].getAttribute('data-col'),
              row: reefs[0].getAttribute('data-row'),
            };
          }
          return null;
        }

        function firstCoralReefForOwner(ownerMark) {
          var mark = normalizeOwnerMark(ownerMark);
          var reefs = grid.querySelectorAll(
            '.hex-structure.hex-structure--coral-reef[data-owner="' + mark + '"]'
          );
          if (!reefs.length) {
            return null;
          }
          return {
            col: reefs[0].getAttribute('data-col'),
            row: reefs[0].getAttribute('data-row'),
          };
        }

        function applyMarkToCell(hexEl, mark) {
          if (!hexEl) {
            return;
          }
          var m = normalizeOwnerMark(mark);
          var col = hexEl.getAttribute('data-col');
          var row = hexEl.getAttribute('data-row');
          var i;
          for (i = 0; i < OWNER_MARKS.length; i += 1) {
            hexEl.classList.remove('owner-' + OWNER_MARKS[i]);
          }
          hexEl.classList.add('owner-' + m);
          hexEl.setAttribute('data-owner', m);

          var structure = grid.querySelector(
            '.hex-structure[data-col="' + col + '"][data-row="' + row + '"]'
          );
          if (structure) {
            for (i = 0; i < OWNER_MARKS.length; i += 1) {
              structure.classList.remove('hex-structure--' + OWNER_MARKS[i]);
            }
            structure.classList.add('hex-structure--' + m);
            structure.setAttribute('data-owner', m);
            var buildingId = hexEl.getAttribute('data-building') || '';
            var nameEl = structure.querySelector('.hex-structure__name');
            if (nameEl && buildingId === 'coral-reef') {
              var gameRef = getGameScope();
              var playerName =
                (gameRef &&
                  gameRef.game &&
                  gameRef.game.captain &&
                  gameRef.game.captain.name) ||
                'CaptainShelly';
              var label = reefLabelForMark(m, playerName);
              nameEl.textContent = label;
              hexEl.setAttribute('data-site-label', label);
            }
          }
          updateMinimapSiteMark(col, row, m);
        }

        /**
         * Mark a structure. If it's a coral reef (or linked to one), update
         * every structure that shares that owner reef so borders stay in sync.
         */
        function setStructureMark(hexEl, mark) {
          if (!hexEl) {
            return;
          }
          var m = normalizeOwnerMark(mark);
          var type = hexEl.getAttribute('data-building') || '';
          var reefCol = hexEl.getAttribute('data-owner-reef-col');
          var reefRow = hexEl.getAttribute('data-owner-reef-row');
          if (type === 'coral-reef') {
            reefCol = hexEl.getAttribute('data-col');
            reefRow = hexEl.getAttribute('data-row');
          }
          if (reefCol == null || reefRow == null) {
            applyMarkToCell(hexEl, m);
            return;
          }
          var reefKey = String(reefCol) + ',' + String(reefRow);
          var seen = {};
          var targets = [];
          var reefHex = cellIndex[reefKey];
          if (reefHex) {
            targets.push(reefHex);
            seen[reefKey] = true;
          }
          var linked = grid.querySelectorAll(
            '.hex[data-owner-reef-col="' +
              String(reefCol) +
              '"][data-owner-reef-row="' +
              String(reefRow) +
              '"]'
          );
          var i;
          var el;
          var key;
          for (i = 0; i < linked.length; i += 1) {
            el = linked[i];
            key =
              el.getAttribute('data-col') + ',' + el.getAttribute('data-row');
            if (!seen[key]) {
              seen[key] = true;
              targets.push(el);
            }
          }
          // Also catch structures that only stored the link on the wrapper
          var wraps = grid.querySelectorAll(
            '.hex-structure[data-owner-reef-col="' +
              String(reefCol) +
              '"][data-owner-reef-row="' +
              String(reefRow) +
              '"]'
          );
          for (i = 0; i < wraps.length; i += 1) {
            key =
              wraps[i].getAttribute('data-col') +
              ',' +
              wraps[i].getAttribute('data-row');
            if (!seen[key] && cellIndex[key]) {
              seen[key] = true;
              targets.push(cellIndex[key]);
            }
          }
          for (i = 0; i < targets.length; i += 1) {
            applyMarkToCell(targets[i], m);
          }
        }

        function showStructureActions(hexEl, left, top) {
          if (!actionsEl) {
            return;
          }
          var type = hexEl.getAttribute('data-building') || '';
          var owner = hexEl.getAttribute('data-owner') || 'own';
          var list = (STRUCTURE_ACTIONS[type] || []).slice();
          // Own structures: no scan / message / profile
          if (owner === 'own') {
            list = list.filter(function (action) {
              return (
                action !== 'scan' &&
                action !== 'message' &&
                action !== 'profile'
              );
            });
          }
          // Tunnel warp only from own / ally sand tunnels
          if (owner !== 'own' && owner !== 'ally') {
            list = list.filter(function (action) {
              return action !== 'teleport';
            });
          }
          // Foreign coral reefs: one flag — color shows mark; tap toggles enemy ↔ neutral
          if (
            type === 'coral-reef' &&
            owner !== 'own' &&
            owner !== 'ally'
          ) {
            list.push('flag');
          }
          actionsEl.innerHTML = '';
          list.forEach(function (action) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hex-action';
            var flagMark = owner === 'enemy' ? 'enemy' : 'neutral';
            if (action === 'flag') {
              btn.className +=
                ' hex-action--flag hex-action--flag-' + flagMark;
              btn.setAttribute(
                'aria-label',
                flagMark === 'enemy'
                  ? 'Enemy flag — tap for neutral'
                  : 'Neutral flag — tap for enemy'
              );
            } else {
              btn.setAttribute('aria-label', ACTION_LABELS[action] || action);
            }
            btn.setAttribute('data-action', action);
            var ico = document.createElement('span');
            if (action === 'flag') {
              ico.className =
                'hex-action-ico hex-action-ico--flag hex-action-ico--flag-' +
                flagMark;
            } else {
              ico.className = 'hex-action-ico hex-action-ico--' + action;
            }
            ico.setAttribute('aria-hidden', 'true');
            btn.appendChild(ico);
            btn.addEventListener('click', function (ev) {
              ev.preventDefault();
              ev.stopPropagation();
              btn.classList.add('is-pressed');
              window.setTimeout(function () {
                btn.classList.remove('is-pressed');
              }, 120);
              if (action === 'move') {
                var s = getGameScope();
                if (s && s.game && selectedCell) {
                  var siteLabel =
                    selectedCell.getAttribute('data-site-label') ||
                    ACTION_LABELS.move;
                  s.$applyAsync(function () {
                    s.game.openMove({
                      col: selectedCell.getAttribute('data-col'),
                      row: selectedCell.getAttribute('data-row'),
                      left: left,
                      top: top,
                      buildingId: type,
                      siteLabel: siteLabel,
                      owner: owner,
                    });
                  });
                }
              } else if (action === 'teleport') {
                var tp = getGameScope();
                if (tp && tp.game && selectedCell) {
                  var tpLabel =
                    selectedCell.getAttribute('data-site-label') ||
                    'Sand Tunnel';
                  tp.$applyAsync(function () {
                    tp.game.openTeleport({
                      col: selectedCell.getAttribute('data-col'),
                      row: selectedCell.getAttribute('data-row'),
                      left: left,
                      top: top,
                      buildingId: type,
                      siteLabel: tpLabel,
                      owner: owner,
                    });
                  });
                }
              } else if (action === 'scan') {
                var scanScope = getGameScope();
                if (scanScope && scanScope.game) {
                  var scanCol = hexEl.getAttribute('data-col');
                  var scanRow = hexEl.getAttribute('data-row');
                  var scanLabel =
                    hexEl.getAttribute('data-site-label') ||
                    type ||
                    'Structure';
                  var fishCount = 0;
                  if (
                    owner === 'own' &&
                    typeof scanScope.game.fishCountAtCell === 'function'
                  ) {
                    fishCount = scanScope.game.fishCountAtCell(
                      scanCol,
                      scanRow
                    );
                  } else {
                    var garrison = parseInt(
                      hexEl.getAttribute('data-garrison') || '',
                      10
                    );
                    fishCount = !isNaN(garrison) && garrison >= 0 ? garrison : 0;
                  }
                  scanScope.$applyAsync(function () {
                    scanScope.game.scanStructure({
                      col: scanCol,
                      row: scanRow,
                      siteLabel: scanLabel,
                      owner: owner,
                      fishCount: fishCount,
                    });
                  });
                }
              } else if (action === 'profile') {
                var profileScope = getGameScope();
                var home = findOwnerCoralReef(hexEl, owner) || {
                  col: hexEl.getAttribute('data-col'),
                  row: hexEl.getAttribute('data-row'),
                };
                // Non-reef structures: jump to owner's coral reef
                if (type !== 'coral-reef') {
                  if (home && focusMapCell(home.col, home.row)) {
                    var jumpReef =
                      cellIndex[String(home.col) + ',' + String(home.row)];
                    if (jumpReef) {
                      selectHex(jumpReef);
                    }
                  }
                } else if (profileScope && profileScope.game) {
                  // Coral reef only: open that player's stats panel
                  var reefHex =
                    home &&
                    cellIndex[String(home.col) + ',' + String(home.row)];
                  var profileName =
                    (reefHex && reefHex.getAttribute('data-player-name')) ||
                    hexEl.getAttribute('data-player-name') ||
                    (reefHex && reefHex.getAttribute('data-site-label')) ||
                    hexEl.getAttribute('data-site-label') ||
                    'Captain';
                  if (
                    profileName === 'Ally Reef' ||
                    profileName === 'Enemy Reef' ||
                    profileName === 'Neutral Reef'
                  ) {
                    profileName =
                      owner === 'ally'
                        ? 'ReefRunner'
                        : owner === 'enemy'
                          ? 'ShadowTide'
                          : 'SandBaron';
                  }
                  var isVip =
                    (reefHex && reefHex.getAttribute('data-vip') === '1') ||
                    hexEl.getAttribute('data-vip') === '1';
                  profileScope.$applyAsync(function () {
                    if (owner === 'own') {
                      profileScope.game.openStats();
                    } else {
                      profileScope.game.openPlayerStats({
                        name: profileName,
                        vip: isVip,
                        owner: owner,
                        col: home.col,
                        row: home.row,
                      });
                    }
                  });
                }
              } else if (action === 'message') {
                var msgScope = getGameScope();
                if (msgScope && msgScope.game) {
                  var reefHome = findOwnerCoralReef(hexEl, owner) || {
                    col: hexEl.getAttribute('data-col'),
                    row: hexEl.getAttribute('data-row'),
                  };
                  var reefEl =
                    reefHome &&
                    cellIndex[String(reefHome.col) + ',' + String(reefHome.row)];
                  var playerName =
                    (reefEl && reefEl.getAttribute('data-player-name')) ||
                    (hexEl.getAttribute('data-player-name') || '') ||
                    (reefEl && reefEl.getAttribute('data-site-label')) ||
                    hexEl.getAttribute('data-site-label') ||
                    'Captain';
                  // Prefer real captain names over generic mark labels
                  if (
                    playerName === 'Ally Reef' ||
                    playerName === 'Enemy Reef' ||
                    playerName === 'Neutral Reef'
                  ) {
                    playerName =
                      owner === 'ally'
                        ? 'ReefRunner'
                        : owner === 'enemy'
                          ? 'ShadowTide'
                          : 'SandBaron';
                  }
                  msgScope.$applyAsync(function () {
                    msgScope.game.openComposeMessage({
                      name: playerName,
                      col: reefHome.col,
                      row: reefHome.row,
                      owner: owner,
                    });
                  });
                }
              } else if (action === 'flag') {
                var nextMark = owner === 'enemy' ? 'neutral' : 'enemy';
                setStructureMark(hexEl, nextMark);
                showStructureActions(hexEl, left, top);
              }
            });
            actionsEl.appendChild(btn);
          });
          actionsEl.style.left = left + hexW / 2 + 'px';
          actionsEl.style.top = top + hexH / 2 + 'px';
          actionsEl.hidden = list.length === 0;
        }

        function clearStructureFront() {
          var raised = grid.querySelectorAll('.hex-structure.is-front');
          var i;
          for (i = 0; i < raised.length; i += 1) {
            raised[i].classList.remove('is-front');
          }
        }

        function bringStructureFront(hexEl) {
          clearStructureFront();
          if (!hexEl) {
            return;
          }
          var col = hexEl.getAttribute('data-col');
          var row = hexEl.getAttribute('data-row');
          var structure = grid.querySelector(
            '.hex-structure[data-col="' + col + '"][data-row="' + row + '"]'
          );
          if (structure) {
            structure.classList.add('is-front');
          }
        }

        function clearHexSelection() {
          if (selectedCell) {
            selectedCell.classList.remove('is-selected');
            selectedCell = null;
          }
          if (selectHalo) {
            selectHalo.hidden = true;
          }
          if (selectFront) {
            selectFront.hidden = true;
          }
          if (buildBtn) {
            buildBtn.hidden = true;
          }
          clearStructureFront();
          hideStructureActions();
        }

        function selectHex(hexEl) {
          var travel = getTravelState();
          // During travel preview, tapping a cell pins the curve there
          if (travel && travel.active) {
            if (hexEl && hexEl.classList.contains('hex')) {
              pinTravelToHex(hexEl);
            }
            return;
          }
          // Map tap clears any selected travelling squad
          if (travel && travel.selectedRouteId) {
            travel.selectedRouteId = null;
            clearTravelSelectionUi();
          }
          if (!hexEl || !hexEl.classList.contains('hex')) {
            clearHexSelection();
            return;
          }
          if (selectedCell === hexEl) {
            clearHexSelection();
            return;
          }
          if (selectedCell) {
            selectedCell.classList.remove('is-selected');
          }
          selectedCell = hexEl;
          // Keep original hex in the sand lattice (avoids a dark hole)
          selectedCell.classList.add('is-selected');
          var left = parseFloat(hexEl.style.left) || 0;
          var top = parseFloat(hexEl.style.top) || 0;
          var fx = ensureSelectFx();
          fx.halo.style.left = left + 'px';
          fx.halo.style.top = top + 'px';
          fx.halo.hidden = false;

          var occupied = hexEl.classList.contains('has-building');
          if (occupied) {
            // Halo only — keep structure visible above highlight
            fx.front.hidden = true;
            bringStructureFront(hexEl);
            if (buildBtn) {
              buildBtn.hidden = true;
            }
            showStructureActions(hexEl, left, top);
          } else {
            clearStructureFront();
            // Bright front copy sits above landmarks
            fx.front.style.left = left + 'px';
            fx.front.style.top = top + 'px';
            fx.front.hidden = false;
            hideStructureActions();
            if (buildBtn) {
              buildBtn.style.left = left + hexW / 2 + 'px';
              buildBtn.style.top = top + hexH / 2 + 'px';
              buildBtn.hidden = false;
            }
          }
        }

        function hexAtClient(clientX, clientY) {
          var rect = stage.getBoundingClientRect();
          var mapX = clientX - rect.left - ox;
          var mapY = clientY - rect.top - oy;
          var lx = mapX - waterMargin;
          var ly = mapY - waterMargin;
          var approxRow = Math.round(ly / rowPitch);
          var odd = approxRow % 2 !== 0;
          var approxCol = Math.round((lx - (odd ? hexW / 2 : 0)) / hexW);
          // Prefer nearest of nearby candidates (pointy-top packing)
          var best = null;
          var bestDist = Infinity;
          var dr;
          var dc;
          var rr;
          var cc;
          var el;
          var cxCell;
          var cyCell;
          var dx;
          var dy;
          var d;
          for (dr = -1; dr <= 1; dr += 1) {
            for (dc = -1; dc <= 1; dc += 1) {
              rr = approxRow + dr;
              cc = approxCol + dc;
              el = cellIndex[cc + ',' + rr];
              if (!el) {
                continue;
              }
              cxCell =
                waterMargin +
                cc * hexW +
                (rr % 2 ? hexW / 2 : 0) +
                hexW / 2;
              cyCell = waterMargin + rr * rowPitch + hexH / 2;
              dx = mapX - cxCell;
              dy = mapY - cyCell;
              d = dx * dx + dy * dy;
              if (d < bestDist) {
                bestDist = d;
                best = el;
              }
            }
          }
          // Reject taps too far from a hex center (water / gaps)
          if (best && bestDist <= (hexW * 0.55) * (hexW * 0.55)) {
            return best;
          }
          return null;
        }

        // Pan / drag — modest overscroll into thin water margins
        var ox = 0;
        var oy = 0;
        var startX = 0;
        var startY = 0;
        var downX = 0;
        var downY = 0;
        var dragging = false;
        var didPan = false;
        var pointerId = null;
        var TAP_SLOP = 8;

        function clampPan() {
          var sw = stage.clientWidth;
          var sh = stage.clientHeight;
          var overX = Math.max(waterMargin, Math.floor(sw * 0.35));
          var overY = Math.max(waterMargin, Math.floor(sh * 0.35));
          var maxX = overX;
          var minX = sw - mapW - overX;
          var maxY = overY;
          var minY = sh - mapH - overY;
          ox = Math.max(minX, Math.min(maxX, ox));
          oy = Math.max(minY, Math.min(maxY, oy));
        }

        var miniInner = document.querySelector('.minimap-inner');
        var miniLand = document.querySelector('.minimap-land');
        var miniView = document.querySelector('.minimap-viewport');
        var miniCrossVT = document.querySelector('.minimap-crosshair__v--top');
        var miniCrossVB = document.querySelector('.minimap-crosshair__v--bot');
        var miniCrossHL = document.querySelector('.minimap-crosshair__h--left');
        var miniCrossHR = document.querySelector('.minimap-crosshair__h--right');

        function updateMinimap() {
          if (!miniLand || !miniView || !miniInner) {
            return;
          }
          var sw = stage.clientWidth;
          var sh = stage.clientHeight;
          var iw = miniInner.clientWidth;
          var ih = miniInner.clientHeight;
          var lw = miniLand.offsetWidth || 54;
          var lh = miniLand.offsetHeight || 46;
          var landLeft = miniLand.offsetLeft;
          var landTop = miniLand.offsetTop;
          // Visible rect in map space → relative to sand plate
          var vx = ((-ox - waterMargin) / sandW) * lw;
          var vy = ((-oy - waterMargin) / sandH) * lh;
          var vw = (sw / sandW) * lw;
          var vh = (sh / sandH) * lh;
          var cx = landLeft + vx + vw / 2;
          var cy = landTop + vy + vh / 2;

          // Small view box at intersection (slight floor for readability)
          var rw = Math.max(8, vw);
          var rh = Math.max(10, vh);
          var boxL = cx - rw / 2;
          var boxT = cy - rh / 2;
          var boxR = boxL + rw;
          var boxB = boxT + rh;
          miniView.style.width = rw + 'px';
          miniView.style.height = rh + 'px';
          miniView.style.transform =
            'translate(' + boxL + 'px,' + boxT + 'px)';

          // Full-span crosshair, clipped out of the view box interior
          if (miniCrossVT) {
            miniCrossVT.style.left = cx + 'px';
            miniCrossVT.style.top = '0';
            miniCrossVT.style.height = Math.max(0, boxT) + 'px';
          }
          if (miniCrossVB) {
            miniCrossVB.style.left = cx + 'px';
            miniCrossVB.style.top = boxB + 'px';
            miniCrossVB.style.height = Math.max(0, ih - boxB) + 'px';
          }
          if (miniCrossHL) {
            miniCrossHL.style.top = cy + 'px';
            miniCrossHL.style.left = '0';
            miniCrossHL.style.width = Math.max(0, boxL) + 'px';
          }
          if (miniCrossHR) {
            miniCrossHR.style.top = cy + 'px';
            miniCrossHR.style.left = boxR + 'px';
            miniCrossHR.style.width = Math.max(0, iw - boxR) + 'px';
          }
        }

        function applyPan() {
          grid.style.transform = 'translate3d(' + ox + 'px,' + oy + 'px,0)';
          updateMinimap();
        }

        function centerMap() {
          // North edge of octagon: water rim above, sand flat edge below
          ox = (stage.clientWidth - mapW) / 2;
          oy = 48;
          clampPan();
          applyPan();
        }

        /** Pan so a map-space point sits in the middle of the stage. */
        function focusMapPoint(mapX, mapY) {
          if (mapX == null || mapY == null) {
            return;
          }
          var sw = stage.clientWidth;
          var sh = stage.clientHeight;
          ox = sw / 2 - Number(mapX);
          oy = sh / 2 - Number(mapY);
          clampPan();
          applyPan();
        }

        function selectMapCell(col, row) {
          var key = String(col) + ',' + String(row);
          var hexEl = cellIndex[key];
          if (!hexEl) {
            return false;
          }
          selectHex(hexEl);
          return true;
        }

        function focusMapCell(col, row) {
          var key = String(col) + ',' + String(row);
          var hexEl = cellIndex[key];
          if (!hexEl) {
            return false;
          }
          var left = parseFloat(hexEl.style.left) || 0;
          var top = parseFloat(hexEl.style.top) || 0;
          focusMapPoint(left + hexW / 2, top + hexH / 2);
          pulseMinimapSite(col, row);
          // All Go / navigate paths select the destination cell
          selectHex(hexEl);
          return true;
        }

        // Click minimap → pan land so that map point centers in the stage
        function jumpToMinimapPoint(clientX, clientY) {
          if (!miniLand) {
            return;
          }
          var rect = miniLand.getBoundingClientRect();
          var lw = miniLand.offsetWidth || 54;
          var lh = miniLand.offsetHeight || 46;
          if (lw <= 0 || lh <= 0) {
            return;
          }
          var fx = (clientX - rect.left) / lw;
          var fy = (clientY - rect.top) / lh;
          var mapX = waterMargin + fx * sandW;
          var mapY = waterMargin + fy * sandH;
          focusMapPoint(mapX, mapY);
        }

        function onMinimapPointerDown(e) {
          // Block land-stage drag; minimap is click-only (not draggable)
          e.preventDefault();
          e.stopPropagation();
        }

        function onMinimapClick(e) {
          e.preventDefault();
          e.stopPropagation();
          jumpToMinimapPoint(e.clientX, e.clientY);
        }

        var miniRoot = document.querySelector('.minimap');
        if (miniRoot) {
          miniRoot.addEventListener('pointerdown', onMinimapPointerDown, {
            passive: false,
          });
          miniRoot.addEventListener('click', onMinimapClick, false);
        }

        var homeBtn = document.querySelector('.minimap-tool--home');

        function onHomeClick(e) {
          e.preventDefault();
          e.stopPropagation();
          var s = getGameScope();
          if (s && s.game && typeof s.game.focusHomeReef === 'function') {
            s.game.focusHomeReef();
            return;
          }
          focusMapCell(49, 5);
        }

        if (homeBtn) {
          homeBtn.addEventListener('click', onHomeClick, false);
        }

        function onPointerDown(e) {
          if (e.button != null && e.button !== 0) {
            return;
          }
          // Build / structure / travel actions handle their own click — don't start a pan
          if (
            e.target &&
            e.target.closest &&
            (e.target.closest('.hex-build-btn') ||
              e.target.closest('.hex-actions') ||
              e.target.closest('.hex-travel-actions') ||
              e.target.closest('.hex-travel-squad.is-selectable'))
          ) {
            return;
          }
          dragging = true;
          didPan = false;
          pointerId = e.pointerId;
          downX = e.clientX;
          downY = e.clientY;
          startX = e.clientX - ox;
          startY = e.clientY - oy;
          stage.classList.add('is-panning');
          if (stage.setPointerCapture) {
            try {
              stage.setPointerCapture(e.pointerId);
            } catch (err) {
              /* ignore */
            }
          }
          e.preventDefault();
        }

        function onPointerMove(e) {
          var travel = getTravelState();
          if (travel && travel.active && !travel.pinned && !dragging) {
            updateTravelFollow(e.clientX, e.clientY);
          }
          if (!dragging || (pointerId != null && e.pointerId !== pointerId)) {
            return;
          }
          if (
            !didPan &&
            (Math.abs(e.clientX - downX) > TAP_SLOP ||
              Math.abs(e.clientY - downY) > TAP_SLOP)
          ) {
            didPan = true;
          }
          if (!didPan) {
            // Still follow cursor while finger is down but not yet panning
            if (travel && travel.active && !travel.pinned) {
              updateTravelFollow(e.clientX, e.clientY);
            }
            return;
          }
          ox = e.clientX - startX;
          oy = e.clientY - startY;
          clampPan();
          applyPan();
          if (travel && travel.active) {
            if (travel.pinned) {
              refreshPinnedTravel();
            } else {
              updateTravelFollow(e.clientX, e.clientY);
            }
          }
        }

        function onTravelPointerMove(e) {
          var travel = getTravelState();
          if (!travel || !travel.active || travel.pinned || dragging) {
            return;
          }
          updateTravelFollow(e.clientX, e.clientY);
        }

        function onPointerUp(e) {
          if (pointerId != null && e.pointerId !== pointerId) {
            return;
          }
          var wasTap = dragging && !didPan;
          var tapX = e.clientX;
          var tapY = e.clientY;
          dragging = false;
          pointerId = null;
          stage.classList.remove('is-panning');
          if (wasTap) {
            selectHex(hexAtClient(tapX, tapY));
          }
        }

        function getGameScope() {
          // hexField uses an isolate scope — GameCtrl lives on $parent
          var s = angular.element(stage).scope();
          if (s && s.game) {
            return s;
          }
          if (s && s.$parent && s.$parent.game) {
            return s.$parent;
          }
          return null;
        }

        function onBuildClick(e) {
          e.preventDefault();
          e.stopPropagation();
          if (!selectedCell) {
            return;
          }
          var left = parseFloat(selectedCell.style.left) || 0;
          var top = parseFloat(selectedCell.style.top) || 0;
          var target = {
            col: selectedCell.getAttribute('data-col'),
            row: selectedCell.getAttribute('data-row'),
            left: left,
            top: top,
          };
          var s = getGameScope();
          if (s && s.game) {
            s.$applyAsync(function () {
              s.game.openBuild(target);
            });
          }
        }

        var miniSites = miniLand
          ? miniLand.querySelector('.minimap-sites')
          : null;

        function addMinimapSite(col, row, owner) {
          if (!miniSites) {
            return;
          }
          var dot = document.createElement('div');
          var own = normalizeOwnerMark(owner);
          dot.className = 'minimap-site minimap-site--' + own;
          // Map grid coords → % of sand footprint on minimap
          var fx = ((Number(col) + 0.5) / cols) * 100;
          var fy = ((Number(row) + 0.5) / rows) * 100;
          dot.style.left = fx + '%';
          dot.style.top = fy + '%';
          dot.setAttribute('data-col', String(col));
          dot.setAttribute('data-row', String(row));
          miniSites.appendChild(dot);
        }

        function placeBuilding(target, buildingId, owner, playerLabel, opts) {
          if (!target || !buildingId) {
            return false;
          }
          var key = target.col + ',' + target.row;
          var hexEl = cellIndex[key];
          if (!hexEl || hexEl.classList.contains('has-building')) {
            return false;
          }
          var own = normalizeOwnerMark(owner);
          if (selectedCell === hexEl) {
            clearHexSelection();
          }
          hexEl.classList.add('has-building');
          hexEl.classList.add('owner-' + own);
          hexEl.setAttribute('data-building', buildingId);
          hexEl.setAttribute('data-owner', own);
          // Foreign sites: sample garrison for Scan Report (own uses live squad totals)
          if (own !== 'own') {
            var garrison =
              buildingId === 'coral-reef'
                ? 18
                : buildingId === 'shell-radar'
                  ? 9
                  : buildingId === 'sand-tunnel'
                    ? 12
                    : 6;
            if (own === 'ally') {
              garrison = Math.max(4, garrison - 4);
            }
            hexEl.setAttribute('data-garrison', String(garrison));
          }
          var gameRef = getGameScope();
          var selfName =
            (gameRef &&
              gameRef.game &&
              gameRef.game.captain &&
              gameRef.game.captain.name) ||
            'CaptainShelly';
          var playerName =
            playerLabel ||
            (own === 'own'
              ? selfName
              : own === 'ally'
                ? 'ReefRunner'
                : own === 'enemy'
                  ? 'ShadowTide'
                  : 'SandBaron');
          var siteLabel = '';
          if (own === 'own' && SITE_NAME_PREFIX[buildingId]) {
            siteCounters[buildingId] = (siteCounters[buildingId] || 0) + 1;
            siteLabel =
              SITE_NAME_PREFIX[buildingId] + ' ' + siteCounters[buildingId];
            hexEl.setAttribute('data-site-label', siteLabel);
          } else if (buildingId === 'coral-reef') {
            siteLabel = playerName;
            hexEl.setAttribute('data-site-label', siteLabel);
          } else {
            siteLabel = SITE_NAME_PREFIX[buildingId] || buildingId;
            hexEl.setAttribute('data-site-label', siteLabel);
          }
          if (buildingId === 'coral-reef') {
            hexEl.setAttribute('data-player-name', playerName);
            if (opts && opts.vip) {
              hexEl.setAttribute('data-vip', '1');
            } else {
              hexEl.removeAttribute('data-vip');
            }
          }
          var wrap = document.createElement('div');
          wrap.className =
            'hex-structure hex-structure--' +
            buildingId +
            ' hex-structure--' +
            own;
          wrap.style.left = target.left + hexW / 2 + 'px';
          wrap.style.top = target.top + hexH / 2 + 'px';
          wrap.setAttribute('data-col', String(target.col));
          wrap.setAttribute('data-row', String(target.row));
          wrap.setAttribute('data-owner', own);
          var marker = document.createElement('div');
          marker.className = 'hex-building hex-building--' + buildingId;
          var nameEl = document.createElement('span');
          nameEl.className = 'hex-structure__name';
          if (buildingId === 'coral-reef') {
            nameEl.className += ' hex-structure__name--player';
            nameEl.textContent = playerName;
          } else {
            nameEl.textContent =
              own === 'own' ? siteLabel : SITE_NAME_PREFIX[buildingId] || buildingId;
          }
          // Link every structure to that owner's coral reef (for Profile → home)
          var reefHome =
            buildingId === 'coral-reef'
              ? { col: String(target.col), row: String(target.row) }
              : firstCoralReefForOwner(own);
          if (reefHome) {
            hexEl.setAttribute('data-owner-reef-col', reefHome.col);
            hexEl.setAttribute('data-owner-reef-row', reefHome.row);
            wrap.setAttribute('data-owner-reef-col', reefHome.col);
            wrap.setAttribute('data-owner-reef-row', reefHome.row);
          }
          wrap.appendChild(marker);
          wrap.appendChild(nameEl);
          grid.appendChild(wrap);
          addMinimapSite(target.col, target.row, own);
          if (own === 'own' && buildingId === 'coral-reef' && gameRef && gameRef.game) {
            gameRef.game.markOwnCoralReef(target.col, target.row);
          }
          return true;
        }

        // Seed own base + sample ally / enemy / neutral sites
        function seedOwnershipSamples() {
          var samples = [
            { col: 49, row: 5, id: 'coral-reef', owner: 'own' },
            { col: 50, row: 5, id: 'shell-radar', owner: 'own' },
            { col: 51, row: 5, id: 'sand-tunnel', owner: 'own' },
            {
              col: 45,
              row: 4,
              id: 'coral-reef',
              owner: 'ally',
              player: 'ReefRunner',
              vip: false,
            },
            { col: 46, row: 4, id: 'shell-radar', owner: 'ally' },
            { col: 47, row: 4, id: 'sand-tunnel', owner: 'ally' },
            {
              col: 48,
              row: 7,
              id: 'coral-reef',
              owner: 'enemy',
              player: 'ShadowTide',
              vip: true,
            },
            { col: 52, row: 5, id: 'sand-tunnel', owner: 'enemy' },
            {
              col: 44,
              row: 8,
              id: 'coral-reef',
              owner: 'neutral',
              player: 'SandBaron',
              vip: true,
            },
          ];
          samples.forEach(function (s) {
            var el = cellIndex[s.col + ',' + s.row];
            if (!el) {
              return;
            }
            placeBuilding(
              {
                col: String(s.col),
                row: String(s.row),
                left: parseFloat(el.style.left) || 0,
                top: parseFloat(el.style.top) || 0,
              },
              s.id,
              s.owner,
              s.player || null,
              { vip: !!s.vip }
            );
          });
        }

        /** Demo: other players moving between non-you structures → orange warn. */
        function seedForeignWarnRoutes() {
          var s = getGameScope();
          if (!s || !s.game || !s.game.travel) {
            return;
          }
          function cellPt(col, row) {
            var el = cellIndex[col + ',' + row];
            if (!el) {
              return null;
            }
            return {
              col: String(col),
              row: String(row),
              left: parseFloat(el.style.left) || 0,
              top: parseFloat(el.style.top) || 0,
              owner: el.getAttribute('data-owner') || null,
              siteLabel: el.getAttribute('data-site-label') || '',
              buildingId: el.getAttribute('data-building') || null,
              hasBuilding: true,
            };
          }
          // ShadowTide enemy reef → SandBaron neutral reef (neither yours/ally)
          var from = cellPt(48, 7);
          var to = cellPt(44, 8);
          if (!from || !to) {
            return;
          }
          var ticks = travelTicksFor(from.col, from.row, to.col, to.row);
          var dx = to.left - from.left;
          var dy = to.top - from.top;
          s.game.nextRouteId = (s.game.nextRouteId || 0) + 1;
          s.game.travel.routes.push({
            id: 'r' + s.game.nextRouteId,
            kind: 'warn',
            owned: false,
            origin: from,
            pinned: to,
            squadIds: [],
            squadCount: 2,
            ticksTotal: ticks,
            ticksLeft: ticks,
            progress: 0,
            facingDeg: (Math.atan2(dx, -dy) * 180) / Math.PI,
          });
          // Incoming threat on you → red (enemy tunnel → your reef)
          var threatFrom = cellPt(52, 5);
          var threatTo = cellPt(49, 5);
          if (threatFrom && threatTo) {
            ticks = travelTicksFor(
              threatFrom.col,
              threatFrom.row,
              threatTo.col,
              threatTo.row
            );
            dx = threatTo.left - threatFrom.left;
            dy = threatTo.top - threatFrom.top;
            s.game.nextRouteId += 1;
            s.game.travel.routes.push({
              id: 'r' + s.game.nextRouteId,
              kind: 'attack',
              owned: false,
              origin: threatFrom,
              pinned: threatTo,
              squadIds: [],
              squadCount: 1,
              ticksTotal: Math.max(ticks, 4),
              ticksLeft: Math.max(ticks, 4),
              progress: 0,
              facingDeg: (Math.atan2(dx, -dy) * 180) / Math.PI,
            });
          }
          // Ally reinforcing you → blue (ally tunnel → your reef)
          var allyFrom = cellPt(47, 4);
          var allyToOwn = cellPt(49, 5);
          if (allyFrom && allyToOwn) {
            ticks = travelTicksFor(
              allyFrom.col,
              allyFrom.row,
              allyToOwn.col,
              allyToOwn.row
            );
            dx = allyToOwn.left - allyFrom.left;
            dy = allyToOwn.top - allyFrom.top;
            s.game.nextRouteId += 1;
            s.game.travel.routes.push({
              id: 'r' + s.game.nextRouteId,
              kind: 'move',
              owned: false,
              origin: allyFrom,
              pinned: allyToOwn,
              squadIds: [],
              squadCount: 2,
              ticksTotal: Math.max(ticks, 3),
              ticksLeft: Math.max(ticks, 3),
              progress: 0,
              facingDeg: (Math.atan2(dx, -dy) * 180) / Math.PI,
            });
          }
          // Ally → ally (radar → reef)
          var allyFrom2 = cellPt(46, 4);
          var allyToAlly = cellPt(45, 4);
          if (allyFrom2 && allyToAlly) {
            ticks = travelTicksFor(
              allyFrom2.col,
              allyFrom2.row,
              allyToAlly.col,
              allyToAlly.row
            );
            dx = allyToAlly.left - allyFrom2.left;
            dy = allyToAlly.top - allyFrom2.top;
            s.game.nextRouteId += 1;
            s.game.travel.routes.push({
              id: 'r' + s.game.nextRouteId,
              kind: 'move',
              owned: false,
              origin: allyFrom2,
              pinned: allyToAlly,
              squadIds: [],
              squadCount: 1,
              ticksTotal: Math.max(ticks, 2),
              ticksLeft: Math.max(ticks, 2),
              progress: 0,
              facingDeg: (Math.atan2(dx, -dy) * 180) / Math.PI,
            });
          }
          // Attack on ally → red (enemy reef → ally reef)
          var atkAllyFrom = cellPt(48, 7);
          var atkAllyTo = cellPt(45, 4);
          if (atkAllyFrom && atkAllyTo) {
            ticks = travelTicksFor(
              atkAllyFrom.col,
              atkAllyFrom.row,
              atkAllyTo.col,
              atkAllyTo.row
            );
            dx = atkAllyTo.left - atkAllyFrom.left;
            dy = atkAllyTo.top - atkAllyFrom.top;
            s.game.nextRouteId += 1;
            s.game.travel.routes.push({
              id: 'r' + s.game.nextRouteId,
              kind: 'attack',
              owned: false,
              origin: atkAllyFrom,
              pinned: atkAllyTo,
              squadIds: [],
              squadCount: 3,
              ticksTotal: Math.max(ticks, 6),
              ticksLeft: Math.max(ticks, 6),
              progress: 0,
              facingDeg: (Math.atan2(dx, -dy) * 180) / Math.PI,
            });
          }
          s.$applyAsync(function () {});
        }

        // Expose placer / selection helpers to GameCtrl + watch travel
        var gameScope = getGameScope();
        if (gameScope && gameScope.game) {
          gameScope.game.placeBuilding = placeBuilding;
          gameScope.game.focusMapCell = focusMapCell;
          gameScope.game.selectMapCell = selectMapCell;
          gameScope.game.focusMapPoint = focusMapPoint;
          gameScope.game.listSandTunnels = function (opts) {
            var owners = (opts && opts.owners) || ['own', 'ally'];
            var out = [];
            var key;
            var hexEl;
            var owner;
            for (key in cellIndex) {
              if (!Object.prototype.hasOwnProperty.call(cellIndex, key)) {
                continue;
              }
              hexEl = cellIndex[key];
              if (
                !hexEl ||
                hexEl.getAttribute('data-building') !== 'sand-tunnel'
              ) {
                continue;
              }
              owner = hexEl.getAttribute('data-owner') || '';
              if (owners.indexOf(owner) < 0) {
                continue;
              }
              out.push({
                col: hexEl.getAttribute('data-col'),
                row: hexEl.getAttribute('data-row'),
                left: parseFloat(hexEl.style.left) || 0,
                top: parseFloat(hexEl.style.top) || 0,
                owner: owner,
                siteLabel:
                  hexEl.getAttribute('data-site-label') || 'Sand Tunnel',
                buildingId: 'sand-tunnel',
              });
            }
            return out;
          };
          gameScope.game.countOwnStructures = function () {
            var n = 0;
            var key;
            var hexEl;
            for (key in cellIndex) {
              if (!Object.prototype.hasOwnProperty.call(cellIndex, key)) {
                continue;
              }
              hexEl = cellIndex[key];
              if (
                hexEl &&
                hexEl.getAttribute('data-owner') === 'own' &&
                hexEl.getAttribute('data-building')
              ) {
                n += 1;
              }
            }
            return n;
          };
          gameScope.game.countStructuresForReef = function (col, row) {
            var c = String(col);
            var r = String(row);
            var n = 0;
            var key;
            var hexEl;
            for (key in cellIndex) {
              if (!Object.prototype.hasOwnProperty.call(cellIndex, key)) {
                continue;
              }
              hexEl = cellIndex[key];
              if (
                !hexEl ||
                !hexEl.getAttribute('data-building') ||
                hexEl.getAttribute('data-owner-reef-col') !== c ||
                hexEl.getAttribute('data-owner-reef-row') !== r
              ) {
                continue;
              }
              n += 1;
            }
            return n;
          };
          gameScope.game.sumGarrisonForReef = function (col, row) {
            var c = String(col);
            var r = String(row);
            var sum = 0;
            var key;
            var hexEl;
            var g;
            for (key in cellIndex) {
              if (!Object.prototype.hasOwnProperty.call(cellIndex, key)) {
                continue;
              }
              hexEl = cellIndex[key];
              if (
                !hexEl ||
                hexEl.getAttribute('data-owner-reef-col') !== c ||
                hexEl.getAttribute('data-owner-reef-row') !== r
              ) {
                continue;
              }
              g = parseInt(hexEl.getAttribute('data-garrison') || '0', 10);
              if (!isNaN(g) && g > 0) {
                sum += g;
              }
            }
            return sum;
          };
          gameScope.game.markStructureOwner = function (col, row, mark) {
            var key = String(col) + ',' + String(row);
            var hexEl = cellIndex[key];
            if (!hexEl) {
              return false;
            }
            setStructureMark(hexEl, mark);
            return true;
          };
          gameScope.game.getStructureAt = function (col, row) {
            var key = String(col) + ',' + String(row);
            var hexEl = cellIndex[key];
            var g;
            if (!hexEl || !hexEl.getAttribute('data-building')) {
              return null;
            }
            g = parseInt(hexEl.getAttribute('data-garrison') || '0', 10);
            return {
              col: hexEl.getAttribute('data-col'),
              row: hexEl.getAttribute('data-row'),
              left: parseFloat(hexEl.style.left) || 0,
              top: parseFloat(hexEl.style.top) || 0,
              buildingId: hexEl.getAttribute('data-building') || '',
              owner: hexEl.getAttribute('data-owner') || null,
              siteLabel: hexEl.getAttribute('data-site-label') || '',
              playerName: hexEl.getAttribute('data-player-name') || '',
              garrison: !isNaN(g) ? g : 0,
            };
          };
          gameScope.game.setStructureGarrison = function (col, row, count) {
            var key = String(col) + ',' + String(row);
            var hexEl = cellIndex[key];
            if (!hexEl) {
              return false;
            }
            hexEl.setAttribute(
              'data-garrison',
              String(Math.max(0, Number(count) || 0))
            );
            return true;
          };
          /**
           * After a winning attack: claim the cell.
           * Coral reef → owned Shell Radar; other buildings → owned mark.
           * Returns the new site label.
           */
          gameScope.game.conquerStructure = function (col, row) {
            var hexEl = cellIndex[String(col) + ',' + String(row)];
            var buildingId;
            var structure;
            var nameEl;
            var marker;
            var siteLabel;
            if (!hexEl || !hexEl.getAttribute('data-building')) {
              return '';
            }
            buildingId = hexEl.getAttribute('data-building') || '';
            structure = grid.querySelector(
              '.hex-structure[data-col="' +
                col +
                '"][data-row="' +
                row +
                '"]'
            );
            if (buildingId === 'coral-reef') {
              // Defeated reef becomes an owned Shell Radar
              siteCounters['shell-radar'] =
                (siteCounters['shell-radar'] || 0) + 1;
              siteLabel =
                SITE_NAME_PREFIX['shell-radar'] +
                ' ' +
                siteCounters['shell-radar'];
              hexEl.setAttribute('data-building', 'shell-radar');
              hexEl.removeAttribute('data-player-name');
              hexEl.removeAttribute('data-vip');
              hexEl.removeAttribute('data-garrison');
              hexEl.setAttribute('data-site-label', siteLabel);
              // Own reef home for this structure is the player's reef
              var ownReef = firstCoralReefForOwner('own');
              if (ownReef) {
                hexEl.setAttribute('data-owner-reef-col', ownReef.col);
                hexEl.setAttribute('data-owner-reef-row', ownReef.row);
              }
              if (structure) {
                structure.className =
                  'hex-structure hex-structure--shell-radar hex-structure--own';
                structure.setAttribute('data-owner', 'own');
                if (ownReef) {
                  structure.setAttribute(
                    'data-owner-reef-col',
                    ownReef.col
                  );
                  structure.setAttribute(
                    'data-owner-reef-row',
                    ownReef.row
                  );
                }
                marker = structure.querySelector('.hex-building');
                if (marker) {
                  marker.className = 'hex-building hex-building--shell-radar';
                }
                nameEl = structure.querySelector('.hex-structure__name');
                if (nameEl) {
                  nameEl.className = 'hex-structure__name';
                  nameEl.textContent = siteLabel;
                }
              }
              applyMarkToCell(hexEl, 'own');
              // Other structures linked to this reef stay enemy-owned
              return siteLabel;
            }
            // Non-reef: claim as owned, clear garrison
            hexEl.removeAttribute('data-garrison');
            setStructureMark(hexEl, 'own');
            siteLabel =
              hexEl.getAttribute('data-site-label') ||
              SITE_NAME_PREFIX[buildingId] ||
              buildingId;
            if (buildingId !== 'coral-reef') {
              siteCounters[buildingId] = (siteCounters[buildingId] || 0) + 1;
              siteLabel =
                (SITE_NAME_PREFIX[buildingId] || buildingId) +
                ' ' +
                siteCounters[buildingId];
              hexEl.setAttribute('data-site-label', siteLabel);
              if (structure) {
                nameEl = structure.querySelector('.hex-structure__name');
                if (nameEl) {
                  nameEl.textContent = siteLabel;
                }
              }
            }
            return siteLabel;
          };
          gameScope.game.clearMapSelection = clearHexSelection;
          gameScope.game.clearTravelSelection = function () {
            var travel = getTravelState();
            if (travel) {
              travel.selectedRouteId = null;
            }
            clearTravelSelectionUi();
          };
        }

        scope.$watch(
          function () {
            var s = getGameScope();
            if (!s || !s.game || !s.game.travel) {
              return '';
            }
            var t = s.game.travel;
            var routeSig = (t.routes || [])
              .map(function (r) {
                return (
                  r.id +
                  ':' +
                  r.ticksLeft +
                  ':' +
                  (r.progress || 0) +
                  ':' +
                  (r.kind || '') +
                  ':' +
                  (r.facingDeg || 0) +
                  ':' +
                  (r.origin
                    ? r.origin.col + ',' + r.origin.row
                    : '') +
                  ':' +
                  (r.pinned
                    ? r.pinned.col + ',' + r.pinned.row
                    : '')
                );
              })
              .join('|');
            return (
              t.active +
              ':' +
              (t.kind || '') +
              ':' +
              (t.pinned
                ? t.pinned.col + ',' + t.pinned.row
                : '') +
              ':' +
              (t.ticks || 0) +
              ':' +
              (t.selectedRouteId || '') +
              ':' +
              routeSig
            );
          },
          function () {
            var travel = getTravelState();
            if (!travelVisible(travel)) {
              stage.classList.remove('is-travelling');
              hideAllTravel();
              return;
            }
            if (travel.active) {
              stage.classList.add('is-travelling');
              hideStructureActions();
            } else {
              stage.classList.remove('is-travelling');
            }
            if (travel.active && travel.pinned) {
              refreshPinnedTravel();
            } else if (travel.active && travel.origin) {
              drawTravelCurve(
                travel.origin.left + hexW / 2 + 40,
                travel.origin.top + hexH / 2 - 48,
                travel.ticks || 0
              );
            } else {
              redrawAllTravel(null, null);
            }
          }
        );

        requestAnimationFrame(function () {
          seedOwnershipSamples();
          seedForeignWarnRoutes();
        });

        if (buildBtn) {
          buildBtn.addEventListener('click', onBuildClick, false);
          buildBtn.addEventListener(
            'pointerdown',
            function (e) {
              e.stopPropagation();
            },
            { passive: false }
          );
        }

        stage.addEventListener('pointerdown', onPointerDown, { passive: false });
        stage.addEventListener('pointermove', onPointerMove, { passive: true });
        stage.addEventListener('pointerup', onPointerUp, { passive: true });
        stage.addEventListener('pointercancel', onPointerUp, { passive: true });
        stage.addEventListener('lostpointercapture', onPointerUp, { passive: true });
        // Follow cursor for travel curve even when not dragging the map
        stage.addEventListener('pointermove', onTravelPointerMove, {
          passive: true,
        });

        // Initial center after layout
        requestAnimationFrame(centerMap);
        window.addEventListener('resize', centerMap);

        scope.$on('$destroy', function () {
          window.removeEventListener('resize', centerMap);
          stage.removeEventListener('pointerdown', onPointerDown);
          stage.removeEventListener('pointermove', onPointerMove);
          stage.removeEventListener('pointermove', onTravelPointerMove);
          stage.removeEventListener('pointerup', onPointerUp);
          stage.removeEventListener('pointercancel', onPointerUp);
          stage.removeEventListener('lostpointercapture', onPointerUp);
          if (buildBtn) {
            buildBtn.removeEventListener('click', onBuildClick);
          }
          if (miniRoot) {
            miniRoot.removeEventListener('pointerdown', onMinimapPointerDown);
            miniRoot.removeEventListener('click', onMinimapClick);
          }
          if (homeBtn) {
            homeBtn.removeEventListener('click', onHomeClick);
          }
        });
      },
    };
  }
})();
