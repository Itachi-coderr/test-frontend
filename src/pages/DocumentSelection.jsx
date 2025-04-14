import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Share2, Clock, Trash2, ExternalLink, Plus, Search, X, Twitter, Facebook, Linkedin, MessageCircleMore } from 'lucide-react';
import { notes } from '../utils/api';
import DocumentTemplates from '../components/DocumentTemplates';
import WhatsAppIcon from '../components/WhatsAppIcon';

const DocumentSelection = () => {
  const [notes, setNotes] = useState({ owned: [], shared: [] });
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await notes.getAll();
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (e, note) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedNote(note);
    setShowShareModal(true);
  };

  const shareViaSocial = (platform) => {
    const shareUrl = `${window.location.origin}/editor/${selectedNote._id}`;
    const title = encodeURIComponent(selectedNote.title);
    const url = encodeURIComponent(shareUrl);

    const socialUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`
    };

    window.open(socialUrls[platform], '_blank', 'width=600,height=400');
  };

  const copyShareLink = async (note) => {
    const shareUrl = `${window.location.origin}/editor/${note._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notes.delete(noteId);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const filteredNotes = {
    owned: notes.owned.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    shared: notes.shared.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Document
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
          <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
                <X className="h-5 w-5" />
          </button>
            )}
        </div>
        </div>

        {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.owned.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {note.title}
                  </h3>
                  <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleShare(e, note)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Share"
                  >
                      <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete"
                  >
                      <Trash2 className="h-5 w-5" />
                  </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {note.content}
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/editor/${note._id}`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                  <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Share Document</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => shareViaSocial('twitter')}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <Twitter className="h-5 w-5 mr-2" />
                      Twitter
                    </button>
                    <button
                      onClick={() => shareViaSocial('facebook')}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <Facebook className="h-5 w-5 mr-2" />
                      Facebook
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => shareViaSocial('linkedin')}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <Linkedin className="h-5 w-5 mr-2" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => shareViaSocial('whatsapp')}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <MessageCircleMore className="h-5 w-5 mr-2" />
                      WhatsApp
                    </button>
                  </div>
                  <button
                    onClick={() => copyShareLink(selectedNote)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Copy Share Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSelection;