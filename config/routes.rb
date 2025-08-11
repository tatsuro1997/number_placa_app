Rails.application.routes.draw do
  root "welcome#index"
  resources :puzzles, only: %i[show]
end
