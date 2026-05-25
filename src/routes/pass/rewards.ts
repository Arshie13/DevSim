export type Reward = {
  level: number;
  free: {
    type: "coins" | "help" | "badge";
    value: string;
  };
  premium: {
    type: "coins" | "help" | "avatar" | "badge";
    value: string;
  };
};

export const rewards: Reward[] = [
  {
    level: 1,
    free: {
      type: 'coins',
      value: '100 Coins'
    },
    premium: {
      type: 'help',
      value: '+3 AI Helps'
    }
  },
  {
    level: 2,
    free: {
      type: 'badge',
      value: 'Starter Badge'
    },
    premium: {
      type: 'coins',
      value: '400 Coins'
    }
  },
  {
    level: 3,
    free: {
      type: 'help',
      value: '+1 AI Help'
    },
    premium: {
      type: 'avatar',
      value: 'Blue Neon Avatar'
    }
  },
  {
    level: 4,
    free: {
      type: 'coins',
      value: '200 Coins'
    },
    premium: {
      type: 'help',
      value: '+5 AI Helps'
    }
  },
  {
    level: 5,
    free: {
      type: 'badge',
      value: 'Common Badge'
    },
    premium: {
      type: 'coins',
      value: '500 Coins'
    }
  },
  {
    level: 6,
    free: {
      type: 'coins',
      value: '300 Coins'
    },
    premium: {
      type: 'avatar',
      value: 'Cyber Avatar'
    }
  },
  {
    level: 7,
    free: {
      type: 'help',
      value: '+2 AI Helps'
    },
    premium: {
      type: 'help',
      value: '+8 AI Helps'
    }
  },
  {
    level: 8,
    free: {
      type: 'coins',
      value: '350 Coins'
    },
    premium: {
      type: 'badge',
      value: 'Elite Badge'
    }
  },
  {
    level: 9,
    free: {
      type: 'help',
      value: '+1 AI Help'
    },
    premium: {
      type: 'coins',
      value: '750 Coins'
    }
  },
  {
    level: 10,
    free: {
      type: 'badge',
      value: 'Silver Badge'
    },
    premium: {
      type: 'avatar',
      value: 'Shadow Avatar'
    }
  },
  {
    level: 11,
    free: {
      type: 'coins',
      value: '450 Coins'
    },
    premium: {
      type: 'help',
      value: '+10 AI Helps'
    }
  },
  {
    level: 12,
    free: {
      type: 'help',
      value: '+2 AI Helps'
    },
    premium: {
      type: 'coins',
      value: '1000 Coins'
    }
  },
  {
    level: 13,
    free: {
      type: 'coins',
      value: '500 Coins'
    },
    premium: {
      type: 'badge',
      value: 'Diamond Badge'
    }
  },
  {
    level: 14,
    free: {
      type: 'badge',
      value: 'Helper Badge'
    },
    premium: {
      type: 'help',
      value: '+12 AI Helps'
    }
  },
  {
    level: 15,
    free: {
      type: 'help',
      value: '+3 AI Helps'
    },
    premium: {
      type: 'avatar',
      value: 'Legend Avatar'
    }
  },
  {
    level: 16,
    free: {
      type: 'coins',
      value: '650 Coins'
    },
    premium: {
      type: 'coins',
      value: '1500 Coins'
    }
  },
  {
    level: 17,
    free: {
      type: 'badge',
      value: 'Bronze Crown'
    },
    premium: {
      type: 'help',
      value: '+15 AI Helps'
    }
  },
  {
    level: 18,
    free: {
      type: 'coins',
      value: '700 Coins'
    },
    premium: {
      type: 'avatar',
      value: 'Galaxy Avatar'
    }
  },
  {
    level: 19,
    free: {
      type: 'help',
      value: '+4 AI Helps'
    },
    premium: {
      type: 'coins',
      value: '1800 Coins'
    }
  },
  {
    level: 20,
    free: {
      type: 'badge',
      value: 'Gold Badge'
    },
    premium: {
      type: 'help',
      value: '+20 AI Helps'
    }
  },
  {
    level: 21,
    free: {
      type: 'coins',
      value: '900 Coins'
    },
    premium: {
      type: 'avatar',
      value: 'Nova Avatar'
    }
  },
  {
    level: 22,
    free: {
      type: 'help',
      value: '+5 AI Helps'
    },
    premium: {
      type: 'badge',
      value: 'Premium Crest'
    }
  },
  {
    level: 23,
    free: {
      type: 'coins',
      value: '1000 Coins'
    },
    premium: {
      type: 'help',
      value: '+25 AI Helps'
    }
  },
  {
    level: 24,
    free: {
      type: 'badge',
      value: 'Expert Badge'
    },
    premium: {
      type: 'coins',
      value: '2200 Coins'
    }
  },
  {
    level: 25,
    free: {
      type: 'help',
      value: '+5 AI Helps'
    },
    premium: {
      type: 'avatar',
      value: 'Royal Avatar'
    }
  },
  {
    level: 26,
    free: {
      type: 'coins',
      value: '1200 Coins'
    },
    premium: {
      type: 'help',
      value: '+30 AI Helps'
    }
  },
  {
    level: 27,
    free: {
      type: 'badge',
      value: 'Master Badge'
    },
    premium: {
      type: 'coins',
      value: '2500 Coins'
    }
  },
  {
    level: 28,
    free: {
      type: 'coins',
      value: '1400 Coins'
    },
    premium: {
      type: 'avatar',
      value: 'Neon Warrior Avatar'
    }
  },
  {
    level: 29,
    free: {
      type: 'help',
      value: '+6 AI Helps'
    },
    premium: {
      type: 'help',
      value: '+35 AI Helps'
    }
  },
  {
    level: 30,
    free: {
      type: 'badge',
      value: 'Season Finale Badge'
    },
    premium: {
      type: 'avatar',
      value: 'Mythic Avatar'
    }
  }
];