import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ToolCard from '../components/ToolCard';
import { MOBILE_TOOLS } from '../data/tools';

const MobileTools = () => {
  const { t } = useTranslation();
  const [selectedTool, setSelectedTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const freeTools = MOBILE_TOOLS.filter(tool => !tool.isPremium);
  const proTools = MOBILE_TOOLS.filter(tool => tool.isPremium);
  const filteredFree = freeTools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPro = proTools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">📱 {t('tools.mobile_tools')}</h1>
        <p className="text-dark-400">15 lightweight tools optimized for mobile devices</p>
      </div>

      {/* Free Tools Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-neon-green"></div>
          <h2 className="text-2xl font-bold">Free Tools (9)</h2>
          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Ad-Supported</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFree.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ToolCard tool={tool} onExecute={setSelectedTool} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pro Tools Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-neon-purple"></div>
          <h2 className="text-2xl font-bold">Pro Tools (6)</h2>
          <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">Premium Only</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPro.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ToolCard tool={tool} onExecute={setSelectedTool} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileTools;
