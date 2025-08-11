Rails.application.routes.draw do
  resources :puzzles, only: %i[show]
end
