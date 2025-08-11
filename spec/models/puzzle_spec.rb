require 'rails_helper'

RSpec.describe Puzzle, type: :model do
  describe '#cells' do
    subject { puzzle.cells }

    let(:puzzle) { described_class.new(problem:) }
    let(:problem) { '003020600900305001001806400008102900700000008006708200002609500800203009005010300' }

    it '9x9の二次元配列を返すこと' do
      expect(subject.size).to eq 9
      expect(subject.all? { |row| row.size == 9 }).to be true
    end

    it 'problem文字列を正しく二次元配列に変換すること' do
      expect(subject[0][0]).to eq '0'
      expect(subject[0][2]).to eq '3'
      expect(subject[0][3]).to eq '0'
      expect(subject[0][4]).to eq '2'
      expect(subject[1][0]).to eq '9'
    end
  end
end
