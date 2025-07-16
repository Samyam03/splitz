'use client'
import React, { useEffect, useState } from 'react'

const CategorySelector = ({categories, onChange}: {categories: {id: string; name: string; icon: any; isDefault?: boolean}[]; onChange: (category: string) => void}) => {
  
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if(onChange && categoryId !== selectedCategory) {
      onChange(categoryId);
    }
  }

  if(!categories || categories.length === 0) {
    return <div className="text-sm text-gray-600 font-medium">No categories found</div>
  }

  useEffect(() => {
    if(!selectedCategory && categories.length > 0) {
      const defaultCategory = categories.find((category)=> category.isDefault)|| categories[0];
  
      setTimeout(() => {
        setSelectedCategory(defaultCategory.id);
        if(onChange) {
          onChange(defaultCategory.id);
        }
      }, 100);
    }
  }, []);

  return (
    <select 
      value={selectedCategory} 
      onChange={(e) => handleCategoryChange(e.target.value)}
      className="w-full h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white/80 border-blue-200 font-medium"
    >
      <option value="">Select a category</option>
      {categories.map((category)=> (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  )
}

export default CategorySelector
