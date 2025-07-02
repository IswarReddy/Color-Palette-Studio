import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Shuffle, Palette, Save, Download, X, AlertTriangle } from 'lucide-react';

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
  ]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [paletteName, setPaletteName] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [copiedColor, setCopiedColor] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hoveredDelete, setHoveredDelete] = useState(null);

  // Generate random color
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Add new color
  const addColor = () => {
    if (colors.length < 10) {
      setColors([...colors, generateRandomColor()]);
    }
  };

  // Remove color with confirmation
  const removeColor = (index) => {
    if (colors.length > 1) {
      setDeleteConfirm({
        type: 'color',
        index: index,
        message: `Remove color ${colors[index]}?`
      });
    }
  };

  // Confirm color deletion
  const confirmColorDelete = () => {
    if (deleteConfirm && deleteConfirm.type === 'color') {
      const newColors = colors.filter((_, i) => i !== deleteConfirm.index);
      setColors(newColors);
      setDeleteConfirm(null);
    }
  };

  // Update color
  const updateColor = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  // Generate random palette
  const generateRandomPalette = () => {
    const newColors = Array(5).fill().map(() => generateRandomColor());
    setColors(newColors);
  };

  // Copy color to clipboard
  const copyColor = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(''), 2000);
    } catch (err) {
      console.error('Failed to copy color');
    }
  };

  // Save palette
  const savePalette = () => {
    if (paletteName.trim()) {
      const newPalette = {
        id: Date.now(),
        name: paletteName,
        colors: [...colors]
      };
      setSavedPalettes([...savedPalettes, newPalette]);
      setPaletteName('');
    }
  };

  // Load saved palette
  const loadPalette = (palette) => {
    setColors(palette.colors);
    setActiveTab('create');
  };

  // Delete saved palette with confirmation
  const deletePalette = (id, name) => {
    setDeleteConfirm({
      type: 'palette',
      id: id,
      message: `Delete palette "${name}"? This action cannot be undone.`
    });
  };

  // Confirm palette deletion
  const confirmPaletteDelete = () => {
    if (deleteConfirm && deleteConfirm.type === 'palette') {
      setSavedPalettes(savedPalettes.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  // Export palette as CSS
  const exportPalette = () => {
    const cssVariables = colors.map((color, index) => 
      `  --color-${index + 1}: ${color};`
    ).join('\n');
    
    const cssContent = `:root {\n${cssVariables}\n}`;
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paletteName || 'palette'}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get complementary color for text
  const getTextColor = (bgColor) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Color Palette Studio
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Create, customize, and save beautiful color palettes
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 flex space-x-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'create' 
                  ? 'bg-white text-purple-900 shadow-lg' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Palette className="inline-block w-5 h-5 mr-2" />
              Create
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'saved' 
                  ? 'bg-white text-purple-900 shadow-lg' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Save className="inline-block w-5 h-5 mr-2" />
              Saved ({savedPalettes.length})
            </button>
          </div>
        </div>

        {activeTab === 'create' ? (
          <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={addColor}
                    disabled={colors.length >= 10}
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Color
                  </button>
                  <button
                    onClick={generateRandomPalette}
                    className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Random
                  </button>
                  <button
                    onClick={exportPalette}
                    className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSS
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Palette name..."
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    className="px-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg border border-white/30 focus:border-white/50 focus:outline-none"
                  />
                  <button
                    onClick={savePalette}
                    disabled={!paletteName.trim()}
                    className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Color Palette Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Color Preview */}
                  <div
                    className="w-full h-32 rounded-xl mb-4 cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
                    style={{ backgroundColor: color }}
                    onClick={() => copyColor(color)}
                  >
                    <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div 
                        className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium"
                        style={{ color: getTextColor(color) }}
                      >
                        {copiedColor === color ? 'Copied!' : 'Click to copy'}
                      </div>
                    </div>
                  </div>

                  {/* Color Controls */}
                  <div className="space-y-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-full h-10 rounded-lg border-2 border-white/30 cursor-pointer"
                    />
                    
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={color.toUpperCase()}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/30 focus:border-white/50 focus:outline-none flex-1 mr-2"
                      />
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyColor(color)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {colors.length > 1 && (
                          <button
                            onClick={() => removeColor(index)}
                            onMouseEnter={() => setHoveredDelete(`color-${index}`)}
                            onMouseLeave={() => setHoveredDelete(null)}
                            className="group/delete p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-6 shadow-lg hover:shadow-red-500/30"
                          >
                            <Trash2 className={`w-4 h-4 transition-all duration-300 ${
                              hoveredDelete === `color-${index}` ? 'animate-bounce' : ''
                            }`} />
                            <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-400 rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 animate-ping"></div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Large Palette View */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-white text-xl font-semibold mb-4">Palette Preview</h3>
              <div className="flex h-24 rounded-xl overflow-hidden shadow-lg">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={() => copyColor(color)}
                  >
                    <span 
                      className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-sm font-medium"
                      style={{ color: getTextColor(color) }}
                    >
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Saved Palettes */
          <div className="space-y-6">
            {savedPalettes.length === 0 ? (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No saved palettes yet</p>
                <p className="text-gray-500">Create and save your first palette!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl"
                  >
                    <h3 className="text-white text-lg font-semibold mb-4">{palette.name}</h3>
                    
                    <div className="flex h-16 rounded-lg overflow-hidden mb-4 shadow-lg">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => copyColor(color)}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => loadPalette(palette)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deletePalette(palette.id, palette.name)}
                        onMouseEnter={() => setHoveredDelete(`palette-${palette.id}`)}
                        onMouseLeave={() => setHoveredDelete(null)}
                        className="group/delete relative p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-lg hover:shadow-red-500/40 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover/delete:opacity-20 transition-opacity duration-300"></div>
                        <Trash2 className={`w-5 h-5 relative z-10 transition-all duration-300 ${
                          hoveredDelete === `palette-${palette.id}` ? 'animate-pulse scale-110' : ''
                        }`} />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-300 rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 animate-ping"></div>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-300 transform scale-x-0 group-hover/delete:scale-x-100 transition-transform duration-300"></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Copy Notification */}
        {copiedColor && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            Copied {copiedColor} to clipboard!
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <h3 className="text-white text-xl font-semibold text-center mb-2">
                Confirm Deletion
              </h3>
              
              <p className="text-gray-300 text-center mb-6">
                {deleteConfirm.message}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteConfirm.type === 'color' ? confirmColorDelete : confirmPaletteDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/30 transform hover:scale-105"
                >
                  <Trash2 className="inline-block w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;