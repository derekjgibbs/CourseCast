import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Copy,
  Trash2,
  Calendar,
  DollarSign,
  GraduationCap,
  BookCheck,
  Users,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react';
import type { UserScenarioDoc } from '@/convex/types';

interface ScenarioManagerProps {
  scenarios?: UserScenarioDoc[];
  activeScenario?: UserScenarioDoc;
  onScenarioChange: (scenario: UserScenarioDoc) => void;
  onCreateScenario: (name: string) => Promise<void> | void;
  onDeleteScenario: (scenario: UserScenarioDoc) => Promise<void> | void;
  onDuplicateScenario: (scenario: UserScenarioDoc) => Promise<void> | void;
  isLoading?: boolean;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void> | void;
}

interface DeleteModalProps {
  isOpen: boolean;
  scenario?: UserScenarioDoc;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const CreateScenarioModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Scenario name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(name.trim());
      setName('');
      onClose();
    } catch (err) {
      setError('Failed to create scenario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-30 p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Create New Scenario</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scenario-name" className="block text-sm font-medium text-gray-700 mb-2">
              Scenario Name
            </label>
            <input
              id="scenario-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter scenario name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Scenario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, scenario, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      // Error handling could be added here
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !scenario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-30 p-6 w-full max-w-md mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Delete Scenario</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete "{scenario.name}"?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All scenario data will be permanently removed.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Scenario'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios = [],
  activeScenario,
  onScenarioChange,
  onCreateScenario,
  onDeleteScenario,
  onDuplicateScenario,
  isLoading = false,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    const scenario = scenarios.find(s => s._id === scenarioId);
    if (scenario) {
      onScenarioChange(scenario);
    }
  };

  const handleDuplicate = async () => {
    if (!activeScenario) return;

    setIsDuplicating(true);
    try {
      await onDuplicateScenario(activeScenario);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!activeScenario) return;
    await onDeleteScenario(activeScenario);
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div
        data-testid="scenario-manager-container"
        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600 text-lg">Loading scenarios...</span>
        </div>
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div
        data-testid="scenario-manager-container"
        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8"
      >
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No scenarios found</h3>
          <p className="text-gray-500 mb-6">Create your first scenario to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Scenario
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        data-testid="scenario-manager-container"
        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8 transition-all duration-300 hover:bg-opacity-30"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Scenario Manager</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              aria-label="Create new scenario"
              tabIndex={0}
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create New
            </button>

            <button
              onClick={handleDuplicate}
              disabled={!activeScenario || isDuplicating}
              aria-label="Duplicate current scenario"
              tabIndex={0}
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </>
              )}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={!activeScenario || scenarios.length <= 1}
              aria-label="Delete current scenario"
              tabIndex={0}
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="mb-6">
          <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-700 mb-2">
            Current Scenario
          </label>
          <select
            id="scenario-select"
            value={activeScenario?._id || ''}
            onChange={handleScenarioChange}
            aria-label="Select active scenario"
            className="w-full px-4 py-3 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-300 focus:bg-opacity-70"
          >
            {scenarios.map(scenario => (
              <option key={scenario._id} value={scenario._id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scenario Details */}
        {activeScenario && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Token Budget</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{activeScenario.token_budget.toLocaleString()}</p>
            </div>

            <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <GraduationCap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Credits</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {activeScenario.min_credits} - {activeScenario.max_credits}
              </p>
            </div>

            <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookCheck className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Required</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {activeScenario.fixed_courses.length} required course{activeScenario.fixed_courses.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Preferences</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {Object.keys(activeScenario.utilities).length} course preference{Object.keys(activeScenario.utilities).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Scenario Metadata */}
        {activeScenario && (
          <div className="border-t border-white border-opacity-20 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatRelativeTime(activeScenario.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Updated {formatRelativeTime(activeScenario.updated_at)}</span>
                </div>
              </div>

              {activeScenario.is_active && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateScenarioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateScenario}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        scenario={activeScenario}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ScenarioManager;
